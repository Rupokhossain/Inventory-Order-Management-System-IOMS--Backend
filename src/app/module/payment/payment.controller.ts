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


export const PaymentController = {
  createBkashPayment,
  executeBkashPayment,
  bkashCallback,
};