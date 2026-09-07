// src/app/module/analytics/analytics.controller.ts

import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { AnalyticsService } from "./analytics.service";
import { sendResponse } from "../../utils/sendResponse";

const getSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getSummary();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard summary retrieved successfully!",
    data: result,
  });
});

export const AnalyticsController = {
  getSummary,
};