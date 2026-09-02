import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  IForgotPasswordPayload,
  ILoginUser,
  IRegisterUser,
  IRequestUser,
  IResetPasswordPayload,
  IVerifyEmailPayload,
} from "./auth.interface";
import httpStatus from "http-status";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";
import ejs from "ejs";
import path from "path";
import { transporter } from "../../lib/nodemailer";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";

const registerUserIntoDB = async (payload: IRegisterUser) => {
  const { name, password, role } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists!");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const expirationSeconds = 5 * 60;

  // Registration OTP
  const otpKey = `ioms-registration-otp:${email}`;
  const otpValue = crypto.randomInt(100000, 1000000).toString();

  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  // Registration data
  const userRegistrationKey = `ioms-registration-data:${email}`;

  const redisUserDataPayload = {
    name,
    email,
    password: hashedPassword,
    role: role || "CUSTOMER",
  };

  await redisClient.set(
    userRegistrationKey,
    JSON.stringify(redisUserDataPayload),
    {
      expiration: {
        type: "EX",
        value: expirationSeconds,
      },
    },
  );

  // Send OTP email
  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/registration-user-otp.ejs",
  );

const html = await ejs.renderFile(templatePath, {
  name,
  email,
  otp: otpValue,
  expirationMinutes: expirationSeconds / 60,
});

  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Email Verification",
    html,
  });
};

const verifyUserEmail = async (payload: IVerifyEmailPayload) => {
  const otp = payload.otp;
  const email = payload.email.trim().toLowerCase();

  // Same key as registerUserIntoDB
  const otpKey = `ioms-registration-otp:${email}`;

  const redisOtp = await redisClient.get(otpKey);

  if (!redisOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "OTP expired or not found. Please register again.",
    );
  }

  if (redisOtp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP!");
  }

  const userRegistrationKey = `ioms-registration-data:${email}`;

  const redisUserData = await redisClient.get(userRegistrationKey);

  if (!redisUserData) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Registration data not found. Please register again.",
    );
  }

  const redisUserDataPayload = JSON.parse(redisUserData);

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    await redisClient.del(otpKey);
    await redisClient.del(userRegistrationKey);

    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User already exists with this email!",
    );
  }

  // Create user
  const result = await prisma.user.create({
    data: {
      ...redisUserDataPayload,
    },
  });

  // Remove temporary registration data
  await redisClient.del(otpKey);
  await redisClient.del(userRegistrationKey);

  // Send welcome email
  try {
    const templatePath = path.join(
      process.cwd(),
      "src/app/templates/welcome-email.ejs",
    );

    const html = await ejs.renderFile(templatePath, {
      name: redisUserDataPayload.name,
    });

    await transporter.sendMail({
      from: config.email_sender,
      to: email,
      subject: "Welcome To Inventory Management and Order System",
      html,
    });
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError);
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = result;
  const user = userWithoutPassword;

  // JWT payload
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    success: true,
    statusCode: httpStatus.OK,
    message: "User registered and verified successfully!",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  };
};

const loginUser = async (payload: ILoginUser) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid email or password!",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid email or password!",
    );
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  return isUserExists;
};

const refreshToken = async (token: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new Error(
      config.node_env === "development"
        ? verifiedRefreshToken.error
        : "Invalid refresh token",
    );
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: {
      id: data.userId,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const forgotPassword = async (payload: IForgotPasswordPayload) => {
  const email = payload.email.trim().toLowerCase();

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const resetOtp = crypto.randomInt(100000, 1000000).toString();

  const otpKey = `ioms-password-reset-otp:${email}`;

  const expirationSeconds = 5 * 60;

  await redisClient.set(otpKey, resetOtp, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/reset-password-success.ejs",
  );

  const html = await ejs.renderFile(templatePath, {
    name: isUserExist.name,
    otp: resetOtp,
    expirationMinutes: expirationSeconds / 60,
  });

  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "IOMS Password Reset OTP",
    html,
  });

  return {
    message: "Password reset OTP sent to email.",
  };
};

const resetPassword = async (payload: IResetPasswordPayload) => {
  const { newPassword, otp } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User does not exist!",
    );
  }

  const key = `ioms-password-reset-otp:${email}`;

  const redisOtp = await redisClient.get(key);

  // Check Redis OTP, not key
  if (!redisOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "OTP expired or not found.",
    );
  }

  if (redisOtp !== otp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP!",
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      password: hashedPassword,
    },
  });

  await redisClient.del(key);

  // Password changed email
  try {
    const templatePath = path.join(
      process.cwd(),
      "src/app/templates/reset-password-success.ejs",
    );

    const html = await ejs.renderFile(templatePath, {
      name: isUserExist.name,
    });

    await transporter.sendMail({
      from: config.email_sender,
      to: isUserExist.email,
      subject: "Password Changed",
      html,
    });
  } catch (emailError) {
    console.error(
      "Failed to send password changed email:",
      emailError,
    );
  }
};

export const AuthService = {
  registerUserIntoDB,
  verifyUserEmail,
  loginUser,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
};