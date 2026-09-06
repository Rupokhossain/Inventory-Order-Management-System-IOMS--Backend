import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  IBkashCreatePaymentResponse,
  IBkashExecutePaymentResponse,
  IBkashGrantTokenResponse,
} from "./payment.interface";
import httpStatus from "http-status";

const getBkashToken = async (): Promise<string> => {
  const url = `${config.bkash_base_url}/tokenized/checkout/token/grant`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: config.bkash_username,
      password: config.bkash_password,
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

  return data.id_token;
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

  if (order.status !== "PENDING") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment can only be initiated for a pending order!",
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
  // ১. পেমেন্ট রেকর্ড খুঁজে নেওয়া
  const payment = await prisma.payment.findUnique({
    where: {
      gatewayPaymentId: paymentID,
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment record not found!");
  }

  // ২. বিকাশের একই টোকেন রিউজ বা গেট করা
  const token = await getBkashToken();

  // ৩. সঠিক Execute Endpoint (URL-এর শেষে ID থাকবে না)
  const url = `${config.bkash_base_url}/tokenized/checkout/execute`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: token,
      "x-app-key": config.bkash_app_key as string,
    },
    body: JSON.stringify({ paymentID }), // Body-তে paymentID দিতে হবে
  });

  const data = (await response.json()) as IBkashExecutePaymentResponse;

  // ৪. বিকাশের রেসপন্স লগ করে চেক করা (ডেবাগিং সহজ করতে)
  console.log("bKash Execute API Response:", data);

  // ৫. পেমেন্ট সফল হলে ডাটাবেজ আপডেট
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

  // ৬. পেমেন্ট ব্যর্থ হলে স্ট্যাটাস FAILED করা
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

export const PaymentService = {
  getBkashToken,
  createBkashPayment,
  executeBkashPayment,
  bkashCallback,
};
