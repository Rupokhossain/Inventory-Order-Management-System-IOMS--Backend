import { OrderStatus } from "../../../generated/prisma/enums";
import { OrderWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  ICreateOrderPayload,
  IOrderQuery,
  IUpdateOrderStatusPayload,
} from "./order.interface";
import httpStatus from "http-status";

const createOrder = async (
  payload: ICreateOrderPayload,
  customerId: string,
) => {
  if (!payload.items || payload.items.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Order must contain at least one product!",
    );
  }

  const productIds = payload.items.map((item) => item.productId);
  const uniqueProductIds = new Set(productIds);

  if (productIds.length !== uniqueProductIds.size) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Same product cannot be added multiple times in one order!",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    const orderItems = [];

    for (const item of payload.items) {
      const product = await tx.product.findUnique({
        where: {
          id: item.productId,
        },
      });

      if (!product) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          `Product not found: ${item.productId}`,
        );
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Product quantity must be a positive integer!",
        );
      }

      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Insufficient stock for product: ${product.name}`,
        );
      }

      const unitPrice = Number(product.price);

      const subtotal = unitPrice * item.quantity;

      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    const order = await tx.order.create({
      data: {
        customerId,
        totalAmount,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        customer: {
          omit: {
            password: true,
          },
        },
      },
    });

    for (const item of payload.items) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }
    return order;
  });

  return result;
};

const getMyOrders = async (customerId: string, query: IOrderQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const allowedSortFields = ["createdAt", "updatedAt", "totalAmount", "status"];

  if (!allowedSortFields.includes(sortBy)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid sort field!");
  }

  const orders = await prisma.order.findMany({
    where: {
      customerId,
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      payment: true,
    },
  });

  const total = await prisma.order.count({
    where: {
      customerId,
    },
  });

  return {
    data: orders,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getSingleOrder = async (
  orderId: string,
  userId: string,
  role: string,
) => {
  const whereCondition: OrderWhereInput = {
    id: orderId,
  };
  if (role === "CUSTOMER") {
    whereCondition.customerId = userId;
  }

  const order = await prisma.order.findFirst({
    where: whereCondition,

    include: {
      orderItems: {
        include: {
          product: true,
        },
      },

      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          profileImg: true,
        },
      },

      payment: true,
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found!");
  }

  return order;
};

const getAllOrders = async (query: IOrderQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const search = query.search?.trim();
  const status = query.status?.trim();

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const allowedSortFields = ["createdAt", "updatedAt", "totalAmount", "status"];

  if (!allowedSortFields.includes(sortBy)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid sort field!");
  }

  const whereCondition: OrderWhereInput = {};

  if (search) {
    whereCondition.OR = [
      {
        id: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        customer: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        customer: {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (status) {
    const allowedStatuses = Object.values(OrderStatus);

    if (!allowedStatuses.includes(status as OrderStatus)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid order status!");
    }

    whereCondition.status = status as OrderStatus;
  }

  const orders = await prisma.order.findMany({
    where: whereCondition,

    skip,
    take: limit,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      orderItems: {
        include: {
          product: true,
        },
      },

      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          profileImg: true,
        },
      },

      payment: true,
    },
  });

  const total = await prisma.order.count({
    where: whereCondition,
  });

  return {
    data: orders,

    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const updateOrderStatus = async (
  orderId: string,
  payload: IUpdateOrderStatusPayload,
) => {
  const newStatus = payload.status as OrderStatus;

  const allowedStatuses = Object.values(OrderStatus);

  if (!allowedStatuses.includes(newStatus)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order status!");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found!");
  }

  if (order.status === newStatus) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Order is already ${newStatus}!`,
    );
  }

  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    PROCESSING: [OrderStatus.SHIPPED],

    SHIPPED: [OrderStatus.DELIVERED],

    DELIVERED: [],

    CANCELLED: [],
  };

  const nextStatuses = allowedTransitions[order.status];

  if (!nextStatuses.includes(newStatus)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot change order status from ${order.status} to ${newStatus}!`,
    );
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id: orderId,
    },

    data: {
      status: newStatus,
    },

    include: {
      orderItems: {
        include: {
          product: true,
        },
      },

      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          profileImg: true,
        },
      },

      payment: true,
    },
  });

  return updatedOrder;
};


const cancelOrder = async (
  orderId: string,
  customerId: string,
) => {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        customerId,
      },

      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Order not found!",
      );
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only pending orders can be cancelled!",
      );
    }

    // Restore stock
    for (const item of order.orderItems) {
      await tx.product.update({
        where: {
          id: item.productId,
        },

        data: {
          stockQuantity: {
            increment: item.quantity,
          },
        },
      });
    }

    const cancelledOrder = await tx.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: OrderStatus.CANCELLED,
      },

      include: {
        orderItems: {
          include: {
            product: true,
          },
        },

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            profileImg: true,
          },
        },

        payment: true,
      },
    });

    return cancelledOrder;
  });

  return result;
};



export const OrderService = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};
