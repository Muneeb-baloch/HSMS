// src/lib/schemas/plotcategory.schema.ts
import * as z from "zod";

export const plotCategorySchema = z
  .object({
    categoryName: z
      .string()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name too long"),

    categoryDesc: z.string().max(500, "Description too long").optional(),

    isActive: z.boolean().default(true),

    surchargeType: z.enum(["none", "percentage", "fixed"]).default("none"),

    surchargePercentage: z
      .union([z.number().min(0).max(100), z.string()])
      .optional()
      .transform((val) => {
        if (val === "" || val === undefined) return 0;
        return Number(val);
      })
      .refine((val) => val === undefined || val === 0 || val >= 0, {
        message: "Percentage must be between 0 and 100",
      }),

    surchargeFixedAmount: z
      .union([z.number().min(0), z.string()])
      .optional()
      .transform((val) => {
        if (val === "" || val === undefined) return 0;
        return Number(val);
      })
      .refine((val) => val === undefined || val === 0 || val >= 0, {
        message: "Fixed amount cannot be negative",
      }),
  })
  .refine(
    (data) => {
      // Ensure only one surcharge type is set
      if (data.surchargeType === "percentage") {
        return (
          (data.surchargePercentage || 0) > 0 &&
          (data.surchargeFixedAmount || 0) === 0
        );
      }
      if (data.surchargeType === "fixed") {
        return (
          (data.surchargeFixedAmount || 0) > 0 &&
          (data.surchargePercentage || 0) === 0
        );
      }
      return (
        (data.surchargePercentage || 0) === 0 &&
        (data.surchargeFixedAmount || 0) === 0
      );
    },
    {
      message: "Cannot have both percentage and fixed amount surcharge",
      path: ["surchargePercentage"],
    },
  );

export type PlotCategoryFormData = z.infer<typeof plotCategorySchema>;
