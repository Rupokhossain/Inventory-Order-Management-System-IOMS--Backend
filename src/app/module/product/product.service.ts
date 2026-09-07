import { ProductWhereInput } from "../../../generated/prisma/models";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  ICreateProductPayload,
  IProductQuery,
  IUpdateProductPayload,
  IUpdateStockPayload,
} from "./product.interface";
import httpStatus from "http-status";

const uploadImageToCloudinary = async (
  file: Express.Multer.File,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ioms/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (!result?.secure_url) {
          reject(new Error("Image upload failed!"));
        } else {
          resolve(result.secure_url);
        }
      },
    );

    uploadStream.end(file.buffer);
  });
};

const createProduct = async (
  payload: ICreateProductPayload,
  image: Express.Multer.File | undefined,
) => {
  const { name, description, price, stockQuantity, categoryId } = payload;

  if (!name?.trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product name is required!");
  }

  if (!categoryId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category is required!");
  }

  const parsedPrice = Number(price);
  const parsedStockQuantity = Number(stockQuantity);

  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Price must be a valid positive number!",
    );
  }

  if (
    Number.isNaN(parsedStockQuantity) ||
    parsedStockQuantity < 0 ||
    !Number.isInteger(parsedStockQuantity)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Stock quantity must be a valid non-negative integer!",
    );
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found!");
  }

  let imageUrl = "";

  if (image) {
    imageUrl = await uploadImageToCloudinary(image);
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Product image is required!");
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description?.trim() || "",
      price: parsedPrice,
      stockQuantity: parsedStockQuantity,
      imageUrl,
      categoryId,
    },

    include: {
      category: true,
    },
  });

  return product;
};

const getAllProducts = async (query: IProductQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;

  const page = query.page ? Number(query.page) : 1;

  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";

  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: ProductWhereInput[] = [];

  if (query.search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const products = await prisma.product.findMany({
    where: {
      AND: andConditions,
    },
    take: limit,
    skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      category: true,
    },
  });

  const total = await prisma.product.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: products,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSingleProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");
  }

  return product;
};

const getLowStockProducts = async (thresholdQuery?: String) => {
  const threshold = thresholdQuery ? Number(thresholdQuery) : 5;

  const lowStockProducts = await prisma.product.findMany({
    where: {
      stockQuantity: {
        lte: threshold,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      stockQuantity: "asc",
    },
  });

  return lowStockProducts;
};

const updateProduct = async (
  id: string,
  payload: IUpdateProductPayload,
  image: Express.Multer.File | undefined,
) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!existingProduct) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");
  }

  // Category check
  if (payload.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, "Category not found!");
    }
  }

  // Price validation
  let parsedPrice: number | undefined;

  if (payload.price !== undefined) {
    parsedPrice = Number(payload.price);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Price must be a valid positive number!",
      );
    }
  }

  // Image upload
  let imageUrl: string | undefined;

  if (image) {
    imageUrl = await uploadImageToCloudinary(image);
  }

  // Prepare update data
  const data: {
    name?: string;
    description?: string | "";
    price?: number;
    categoryId?: string;
    imageUrl?: string;
  } = {};

  if (payload.name !== undefined) {
    data.name = payload.name.trim();
  }

  if (payload.description !== undefined) {
    data.description = payload.description.trim();
  }

  if (parsedPrice !== undefined) {
    data.price = parsedPrice;
  }

  if (payload.categoryId !== undefined) {
    data.categoryId = payload.categoryId;
  }

  if (imageUrl !== undefined) {
    data.imageUrl = imageUrl;
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id,
    },

    data,

    include: {
      category: true,
    },
  });

  return updatedProduct;
};

const updateStock = async (id: string, payload: IUpdateStockPayload) => {
  const quantity = Number(payload.quantity);

  if (Number.isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Quantity must be a positive integer!",
    );
  }

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id,
    },

    data: {
      stockQuantity: {
        increment: quantity,
      },
    },

    include: {
      category: true,
    },
  });

  return updatedProduct;
};

const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found!");
  }

  const deletedProduct = await prisma.product.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  return deletedProduct;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getLowStockProducts,
  updateProduct,
  updateStock,
  deleteProduct,
};
