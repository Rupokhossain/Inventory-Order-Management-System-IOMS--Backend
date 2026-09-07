import { z } from "zod";

const createOrderValidationSchema = z.object({
  orderItems: z
    .array(
      z.object({
        productId: z.uuid("Invalid product ID."),

        quantity: z
          .number()
          .int("Quantity must be an integer.")
          .positive("Quantity must be greater than 0."),
      }),
    )
    .min(1, "At least one product is required."),
});

export const OrderValidation = {
  createOrderValidationSchema,
};