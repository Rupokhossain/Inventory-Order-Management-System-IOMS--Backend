import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(32, "Password cannot exceed 32 characters.")
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter.",
  )
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter.",
  )
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character.",
  );



const registerValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(50, "Name cannot exceed 50 characters."),

  email: z
    .email("Please provide a valid email address.")
    .transform((value) => value.trim().toLowerCase()),

  password: passwordSchema,

  role: z
    .enum(["ADMIN", "MANAGER", "CUSTOMER"])
    .optional()
    .default("CUSTOMER"),

  contactNumber: z
    .string()
    .trim()
    .min(10, "Contact number must be at least 10 digits.")
    .max(15, "Contact number cannot exceed 15 digits.")
    .optional(),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters long.")
    .max(200, "Address cannot exceed 200 characters.")
    .optional(),
});


const loginValidationSchema = z.object({
  email: z
    .email("Please provide a valid email address.")
    .transform((value) => value.trim().toLowerCase()),

  password: passwordSchema,
});



const verifyEmailValidationSchema = z.object({
  email: z
    .email("Please provide a valid email address.")
    .transform((value) => value.trim().toLowerCase()),

  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits."),
});


const forgotPasswordValidationSchema = z.object({
  email: z
    .email("Please provide a valid email address.")
    .transform((value) => value.trim().toLowerCase()),
});


const resetPasswordValidationSchema = z.object({
  email: z
    .email("Please provide a valid email address.")
    .transform((value) => value.trim().toLowerCase()),

  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits."),

  newPassword: passwordSchema,
});






export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  verifyEmailValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,

};