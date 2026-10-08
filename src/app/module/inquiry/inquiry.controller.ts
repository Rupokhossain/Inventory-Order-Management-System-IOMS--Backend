import { Request, Response } from "express";
import httpStatus from "http-status";
import { InquiryService } from "./inquiry.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createInquiry = catchAsync(async (req: Request, res: Response) => {
  const result = await InquiryService.createInquiry(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Your inquiry has been submitted successfully!",
    data: result,
  });
});

const getAllInquiries = catchAsync(async (req: Request, res: Response) => {
  const result = await InquiryService.getAllInquiries(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer inquiries retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const updateInquiryStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reply } = req.body;
  const result = await InquiryService.updateInquiryStatus(id as string, status, reply);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Inquiry status updated successfully!",
    data: result,
  });
});

const deleteInquiry = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await InquiryService.deleteInquiry(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Inquiry deleted successfully!",
    data: result,
  });
});

export const InquiryController = {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry,
};
