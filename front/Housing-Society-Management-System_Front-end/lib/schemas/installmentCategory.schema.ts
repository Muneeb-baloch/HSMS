// src/lib/schemas/installmentCategory.schema.ts
import * as z from "zod";

export const installmentCategorySchema = z.object({
  instCatName: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters")
    .trim(),

  instCatDescription: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),

  isRefundable: z.boolean().default(false),

  isMandatory: z.boolean().default(true),

  sequenceOrder: z
    .union([
      z.number().int().min(1, "Sequence order must be at least 1"),
      z.string(),
    ])
    .transform((val) => Number(val)),

  isActive: z.boolean().default(true),
});

export const reorderCategoriesSchema = z.object({
  categoryOrders: z
    .array(
      z.object({
        id: z.string().min(1, "Category ID is required"),
        sequenceOrder: z
          .number()
          .int()
          .min(1, "Sequence order must be at least 1"),
      }),
    )
    .min(1, "At least one category is required"),
});

export type InstallmentCategoryFormData = z.infer<
  typeof installmentCategorySchema
>;
export type ReorderCategoriesFormData = z.infer<typeof reorderCategoriesSchema>;
