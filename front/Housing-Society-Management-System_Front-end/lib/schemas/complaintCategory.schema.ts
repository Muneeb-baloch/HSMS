// src/lib/schemas/complaintCategory.schema.ts
import * as z from "zod";

export const complaintCategorySchema = z.object({
  categoryName: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),

  categoryCode: z
    .string()
    .min(2, "Category code must be at least 2 characters")
    .max(20, "Category code cannot exceed 20 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Category code must contain only uppercase letters and numbers",
    )
    .transform((val) => val.toUpperCase()),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  priorityLevel: z
    .number()
    .min(1, "Priority level must be at least 1")
    .max(10, "Priority level cannot exceed 10")
    .default(5),

  slaHours: z
    .number()
    .min(1, "SLA hours must be at least 1")
    .optional()
    .default(72),

  isActive: z.boolean().default(true),
});

export const importCategorySchema = z.array(complaintCategorySchema);

export type ComplaintCategoryFormData = z.infer<typeof complaintCategorySchema>;
export type ImportCategoryFormData = z.infer<typeof importCategorySchema>;
