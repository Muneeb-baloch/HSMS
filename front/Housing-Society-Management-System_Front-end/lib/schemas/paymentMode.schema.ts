// src/lib/schemas/paymentMode.schema.ts
import * as z from "zod";

export const paymentModeSchema = z.object({
  paymentModeName: z
    .string()
    .min(1, "Payment Mode Name is required")
    .max(100, "Payment Mode Name cannot exceed 100 characters")
    .trim(),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  isActive: z.boolean().default(true),
});

export type PaymentModeFormData = z.infer<typeof paymentModeSchema>;
