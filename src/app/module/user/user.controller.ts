
import { Request, Response } from "express";
import httpStatus from "http-status";

import { UserService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {

    const userId = req.user?.userId as string;

  const result = await UserService.getMyProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully!",
    data: result,
  });
});


const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const result = await UserService.updateMyProfile(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully!",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully!",
    data: result,
  });
});


const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await UserService.getSingleUser(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully!",
    data: result,
  });
});


const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await UserService.updateUserStatus(
      id as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User status updated successfully!",
      data: result,
    });
  },
);


const changePassword = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    await UserService.changePassword(
      userId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password changed successfully!",
      data: null,
    });
  },
);

export const UserController = {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  changePassword
};