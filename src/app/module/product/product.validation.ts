import { z } from "zod";

const createProductValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters long.")
    .max(100, "Product name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long.")
    .max(1000, "Description cannot exceed 1000 characters."),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0."),

  stockQuantity: z.coerce
    .number()
    .int("Stock quantity must be an integer.")
    .min(0, "Stock quantity cannot be negative."),

  categoryId: z
    .uuid("Invalid category ID."),
});

const updateProductValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters long.")
    .max(100, "Product name cannot exceed 100 characters.")
    .optional(),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long.")
    .max(1000, "Description cannot exceed 1000 characters.")
    .optional(),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0.")
    .optional(),

  stockQuantity: z.coerce
    .number()
    .int("Stock quantity must be an integer.")
    .min(0, "Stock quantity cannot be negative.")
    .optional(),

  categoryId: z
    .uuid("Invalid category ID.")
    .optional(),
});

export const ProductValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
};