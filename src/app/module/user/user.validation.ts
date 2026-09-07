import z from "zod";


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

 const changePasswordValidationSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required."),

  newPassword: passwordSchema,
});


export const UserValidation = {
    changePasswordValidationSchema
}