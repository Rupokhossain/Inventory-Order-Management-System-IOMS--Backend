import { Role } from "../../../generated/prisma/enums";
import { PaymentWhereInput } from "../../../generated/prisma/models";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { IUserQuery } from "../user/user.interface";
import {
  IBkashCreatePaymentResponse,
  IBkashExecutePaymentResponse,
  IBkashGrantTokenResponse,
} from "./payment.interface";
import httpStatus from "http-status";


const getBkashToken = async (): Promise<string> => {
  try {
    const IdTokenKey = "bkash:idToken";
    const RefreshTokenKey = "bkash:refreshToken";

    let bkashIdToken = await redisClient.get(IdTokenKey);
    const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey);

    const bkashRefreshToken = await redisClient.get(RefreshTokenKey);
    const bkashRefreshTokenTTL = await redisClient.ttl(RefreshTokenKey);

    if (
      (bkashIdTokenTTL <= 600 || !bkashIdToken) &&
      bkashRefreshToken &&
      bkashRefreshTokenTTL > 600
    ) {
      const refreshUrl = `${config.bkash_base_url}/tokenized/checkout/token/refresh`;

      const refreshTokenResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config.bkash_username as string,
          password: config.bkash_password as string,
        },
        body: JSON.stringify({
          app_key: config.bkash_app_key,
          app_secret: config.bkash_app_secret,
          refresh_token: bkashRefreshToken,
        }),
      });

      const refreshData = (await refreshTokenResponse.json()) as IBkashGrantTokenResponse;

      if (refreshTokenResponse.ok && refreshData.id_token) {
        bkashIdToken = refreshData.id_token;

        await redisClient.set(IdTokenKey, bkashIdToken, {
          expiration: {
            type: "EX",
            value: 60 * 60,
          },
        });

        return bkashIdToken;
      }
    }

    if (bkashIdToken && bkashIdTokenTTL > 600) {
      return bkashIdToken;
    }

    const grantUrl = `${config.bkash_base_url}/tokenized/checkout/token/grant`;

    const response = await fetch(grantUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: config.bkash_username as string,
        password: config.bkash_password as string,
      },
      body: JSON.stringify({
        app_key: config.bkash_app_key,
        app_secret: config.bkash_app_secret,
      }),
    });

    const data = (await response.json()) as IBkashGrantTokenResponse;

    if (!response.ok || !data.id_token) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        data.statusMessage || "Failed to get bKash token!",
      );
    }

  
    await redisClient.set(IdTokenKey, data.id_token, {
      expiration: {
        type: "EX",
        value: 60 * 60,
      },
    });

    if (data.refresh_token) {
      await redisClient.set(RefreshTokenKey, data.refresh_token, {
        expiration: {
          type: "EX",
          value: 60 * 60 * 24 * 28,
        },
      });
    }

    return data.id_token;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      error.message || "Failed to process bKash token!",
    );
  }
};

const createBkashPayment = async (orderId: string, customerId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId,
    },

    include: {
      payment: true,
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found!");
  }

  // if (order.status !== "PENDING") {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     "Payment can only be initiated for a pending order!",
  //   );
  // }

  if (
    order.status === ("CONFIRMED" as string) ||
    order.status === ("COMPLETED" as string)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This order is already confirmed and cannot be paid again!",
    );
  }

  if (order.payment && order.payment.status === "PAID") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This order has already been paid!",
    );
  }

  const token = await getBkashToken();

  const merchantInvoiceNumber = `INV_${order.id}_${Date.now()}`;

  const url = `${config.bkash_base_url}/tokenized/checkout/create`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",

      authorization: token,

      "x-app-key": config.bkash_app_key,
    },

    body: JSON.stringify({
      mode: "0011",
      payerReference: customerId,
      callbackURL: config.bkash_callback_url,
      amount: Number(order.totalAmount).toFixed(2),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber,
    }),
  });

  const data = (await response.json()) as IBkashCreatePaymentResponse;

  console.log("bKash Create Status:", response.status);
  console.log("bKash Create Response:", data);

  if (!response.ok || !data.paymentID || !data.bkashURL) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      data.statusMessage || "Failed to create bKash payment!",
    );
  }

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let payment;

  if (order.payment) {
    payment = await prisma.payment.update({
      where: {
        id: order.payment.id,
      },
      data: {
        gatewayPaymentId: data.paymentID,
        amount: order.totalAmount.toString(),
        paymentGateway: "BKASH",
        status: "PENDING",
        transactionId: null,
      },
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        gatewayPaymentId: data.paymentID,
        amount: order.totalAmount,
        paymentGateway: "BKASH",
        status: "PENDING",
      },
    });
  }
  return {
    paymentId: payment.id,
    bkashPaymentId: data.paymentID,
    bkashURL: data.bkashURL,
    amount: order.totalAmount,
    orderId: order.id,
  };
};

const executeBkashPayment = async (paymentID: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      gatewayPaymentId: paymentID,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment record not found!");
  }

  const token = await getBkashToken();

  const url = `${config.bkash_base_url}/tokenized/checkout/execute`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: token,
      "x-app-key": config.bkash_app_key as string,
    },
    body: JSON.stringify({ paymentID }),
  });

  const data = (await response.json()) as IBkashExecutePaymentResponse;

  console.log("bKash Execute API Response:", data);

  if (response.ok && data.statusCode === "0000" && data.trxID) {
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          transactionId: data.trxID,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: "CONFIRMED",
        },
      });

      return {
        payment: updatedPayment,
        order: updatedOrder,
      };
    });

    return result;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
    },
  });

  throw new AppError(
    httpStatus.BAD_REQUEST,
    data.statusMessage || "bKash payment failed!",
  );
};

const bkashCallback = async (paymentID: string, status: string) => {
  if (!paymentID) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment ID is missing!");
  }

  if (status === "cancel") {
    const payment = await prisma.payment.findUnique({
      where: {
        gatewayPaymentId: paymentID,
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "FAILED",
        },
      });
    }
    return {
      success: false,
      message: "Payment cancelled by customer.",
    };
  }

  if (status === "failure") {
    const payment = await prisma.payment.findUnique({
      where: {
        gatewayPaymentId: paymentID,
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "FAILED",
        },
      });
    }

    return {
      success: false,
      message: "bKash payment failed.",
    };
  }

  if (status === "success") {
    return await executeBkashPayment(paymentID);
  }

  throw new AppError(httpStatus.BAD_REQUEST, "Invalid bKash payment status!");
};

const getMyPayments = async (query: IUserQuery, user: RequestUser) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const payments = await prisma.payment.findMany({
    where: {
      order: {
        customerId: user.userId,
      },
    },
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      order: {
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.payment.count({
    where: {
      order: {
        customerId: user.userId,
      },
    },
  });

  return {
    data: payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAllPayments = async (query: IUserQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const whereConditions: PaymentWhereInput[] = [];

  if (query.customerEmail) {
    whereConditions.push({
      order: {
        customer: {
          email: query.customerEmail,
        },
      },
    });
  }

  if (query.status) {
    whereConditions.push({
      status: query.status,
    });
  }

  if (query.paymentGateway) {
    whereConditions.push({
      paymentGateway: query.paymentGateway,
    });
  }

  const payments = await prisma.payment.findMany({
    where: {
      AND: whereConditions,
    },
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      order: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.payment.count({
    where: {
      AND: whereConditions,
    },
  });

  return {
    data: payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSinglePayment = async (paymentId: string, user: RequestUser) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      order: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  if (user.role === Role.CUSTOMER) {
    if (payment.order.customerId !== user.userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to view this payment!",
      );
    }
  }

  return payment;
};

export const PaymentService = {
  getBkashToken,
  createBkashPayment,
  executeBkashPayment,
  bkashCallback,
  getMyPayments,
  getAllPayments,
  getSinglePayment,
};
