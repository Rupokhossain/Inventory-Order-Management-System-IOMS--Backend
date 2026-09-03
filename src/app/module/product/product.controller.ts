import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ProductService } from "./product.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";


const createProduct = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.createProduct(
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Product created successfully!",
      data: result,
    });
  },
)


const getAllProducts = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.getAllProducts();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Products retrieved successfully!",
      data: result,
    });
  },
);


const getSingleProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProductService.getSingleProduct(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product retrieved successfully!",
      data: result,
    });
  },
)

const updateProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProductService.updateProduct(
      id as string,
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product updated successfully!",
      data: result,
    });
  },
);


const updateStock = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProductService.updateStock(
      id as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product stock updated successfully!",
      data: result,
    });
  },
);


const deleteProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProductService.deleteProduct(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product deleted successfully!",
      data: result,
    });
  },
);


export const ProductController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  updateStock,
  deleteProduct,
};