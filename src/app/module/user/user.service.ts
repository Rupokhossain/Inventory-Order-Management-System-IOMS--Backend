import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IChangePasswordPayload, IUpdateProfilePayload, IUpdateUserStatusPayload } from "./user.interface";
import httpStatus from "http-status"


const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      provider: true,
      profileImg: true,
      needsPasswordChange: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found!");
  }

  return user;
};


const updateMyProfile = async (
  userId: string,
  payload: IUpdateProfilePayload,
) => {
     const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  }); 

    if (!user) {
    throw new Error("User not found!");
  }

  const updateData: Record<string, any> = {};

if (payload.name) updateData.name = payload.name;
if (payload.profileImg) updateData.profileImg = payload.profileImg;


  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data:  updateData,
  
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      provider: true,
      profileImg: true,
      needsPasswordChange: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;

}


const getAllUsers = async () => {
    const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      provider: true,
      profileImg: true,
      needsPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}


const getSingleUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      provider: true,
      profileImg: true,
      needsPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};


const updateUserStatus = async (
  userId: string,
  payload: IUpdateUserStatusPayload,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: payload.status,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      provider: true,
      profileImg: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};


const changePassword = async(userId: string, payload: IChangePasswordPayload) => {
  const { oldPassword, newPassword } = payload;

    const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

    if (!user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You don't have a password. Please use Google login.",
    );
  }

    const isPasswordMatched = await bcrypt.compare(
    oldPassword,
    user.password,
  );


    if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Old password is incorrect!",
    );
  }

    if (oldPassword === newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password must be different from old password!",
    );
  }

    const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  );

    await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
      needsPasswordChange: false,
    },
  });

  return null;

}

export const UserService = {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  changePassword
};