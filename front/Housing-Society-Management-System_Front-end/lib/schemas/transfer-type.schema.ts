// src/lib/schemas/transfer-type.schema.ts
import { z } from "zod";

export const transferTypeSchema = z.object({
  typeName: z
    .string()
    .min(2, "Type name must be at least 2 characters")
    .max(100, "Type name cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  transferFee: z.preprocess((val) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed === "") return NaN;
      const n = Number(trimmed);
      return isNaN(n) ? val : n;
    }
    return val;
  }, z.number().min(0, "Transfer fee must be a positive number").positive("Transfer fee must be greater than 0")),
});

export const updateTransferTypeSchema = z.object({
  typeName: z
    .string()
    .min(2, "Type name must be at least 2 characters")
    .max(100, "Type name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  transferFee: z
    .preprocess((val) => {
      if (val === undefined || val === "") return undefined;
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (trimmed === "") return undefined;
        const n = Number(trimmed);
        return isNaN(n) ? val : n;
      }
      return val;
    }, z.number().min(0, "Transfer fee must be a positive number").positive("Transfer fee must be greater than 0"))
    .optional(),
  isActive: z.boolean().optional(),
});

export type TransferTypeFormData = z.infer<typeof transferTypeSchema>;
export type UpdateTransferTypeFormData = z.infer<
  typeof updateTransferTypeSchema
>;
