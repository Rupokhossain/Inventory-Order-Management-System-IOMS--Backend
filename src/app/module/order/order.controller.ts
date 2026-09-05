import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { OrderService } from "./order.service";
import { sendResponse } from "../../utils/sendResponse";
import { IOrderQuery } from "./order.interface";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.userId;

  const result = await OrderService.createOrder(req.body, customerId as string);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully!",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.userId;

  const result = await OrderService.getMyOrders(
    customerId as string,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My orders retrieved successfully!",
    data: result,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const userId = req.user?.userId as string;
  const role = req.user?.role as string;

  const result = await OrderService.getSingleOrder(id as string, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieved successfully!",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders(req.query as IOrderQuery);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully!",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await OrderService.updateOrderStatus(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully!",
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const customerId = req.user?.userId as string;

  const result = await OrderService.cancelOrder(id as string, customerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order cancelled successfully!",
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
