import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";

const createBkashPayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const customerId = req.user?.userId;

  const result = await PaymentService.createBkashPayment(
    orderId as string,
    customerId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "bKash payment created successfully!",
    data: result,
  });
});

const executeBkashPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentID } = req.body;

  const result = await PaymentService.executeBkashPayment(paymentID);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "bKash payment executed successfully!",
    data: result,
  });
});

const bkashCallback = catchAsync(async (req: Request, res: Response) => {
  const { paymentID, status } = req.query;

  const result = await PaymentService.bkashCallback(
    paymentID as string,
    status as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment completed successfully!",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getMyPayments(req.query, req.user!);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My payments retrieved successfully!",
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All payments retrieved successfully!",
    data: result,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  const result = await PaymentService.getSinglePayment(
    paymentId as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment retrieved successfully!",
    data: result,
  });
});

export const PaymentController = {
  createBkashPayment,
  executeBkashPayment,
  bkashCallback,

  getMyPayments,
  getAllPayments,
  getSinglePayment,
};
