import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import config from "../../config";

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

  try {
    const result = await PaymentService.bkashCallback(
      paymentID as string,
      status as string,
    );

    if (status === "success" && (result as any)?.order) {
      const orderId = (result as any).order.id;
      const amount = (result as any).payment?.amount || "";
      const trxId = (result as any).payment?.transactionId || "";
      return res.redirect(
        `${config.frontend_url}/payment/success?orderId=${orderId}&amount=${amount}&method=bkash&trxId=${trxId}`
      );
    }

    return res.redirect(
      `${config.frontend_url}/payment/cancel?status=${status || "cancelled"}`
    );
  } catch (err: any) {
    console.error("bKash Callback Error:", err);
    return res.redirect(
      `${config.frontend_url}/payment/cancel?error=${encodeURIComponent(
        err?.message || "Payment execution failed"
      )}`
    );
  }
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
