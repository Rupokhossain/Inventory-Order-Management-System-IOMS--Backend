import { CategoryWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  ICategoryQuery,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
} from "./category.interface";
import httpStatus from "http-status";

const createCategory = async (payload: ICreateCategoryPayload) => {
  const name = payload.name.trim();

  if (!name) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category name is required!");
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    throw new AppError(httpStatus.CONFLICT, "Category already exists!");
  }

  const category = await prisma.category.create({
    data: {
      name,
      description: payload.description?.trim() || null,
    },
  });

  return category;
};

const getAllCategories = async (query: ICategoryQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;

  const page = query.page ? Number(query.page) : 1;

  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";

  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: CategoryWhereInput[] = [];

  if (query.search) {
    andConditions.push({
      name: {
        contains: query.search,
        mode: "insensitive",
      },
    });
  }

  const categories = await prisma.category.findMany({
    where: {
      AND: andConditions,
    },

    take: limit,
    skip,

    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.category.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: categories,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSingleCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found!");
  }

  return category;
};

const updateCategory = async (id: string, payload: IUpdateCategoryPayload) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!existingCategory) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found!");
  }

  if (payload.name) {
    const name = payload.name.trim();

    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name,
        NOT: {
          id,
        },
      },
    });

    if (duplicateCategory) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Another category with this name already exists!",
      );
    }

    payload.name = name;
  }

  if (payload.description) {
    payload.description = payload.description.trim();
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id,
    },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
    },
  });

  return updatedCategory;
};

const deleteCategory = async (id: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
  if (!existingCategory) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found!");
  }

  if (existingCategory._count.products > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category because it contains associated products!",
    );
  }

  const category = await prisma.category.delete({
    where: {
      id,
    },
  });

  return category;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
