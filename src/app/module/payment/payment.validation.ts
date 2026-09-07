import { z } from "zod";

const executeBkashPaymentValidationSchema = z.object({
  paymentID: z
    .string()
    .trim()
    .min(1, "Payment ID is required."),
});

export const PaymentValidation = {
  executeBkashPaymentValidationSchema,
};