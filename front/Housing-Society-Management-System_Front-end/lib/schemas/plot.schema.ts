// src/lib/schemas/plot.schema.ts
import * as z from "zod";

export const plotSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  plotNo: z
    .string()
    .min(1, "Plot number is required")
    .max(20, "Plot number too long"),
  plotBlockId: z.string().min(1, "Plot block is required"),
  plotSizeId: z.string().min(1, "Plot size is required"),
  plotType: z.enum([
    "residential",
    "commercial",
    "industrial",
    "agricultural",
    "corner",
    "park_facing",
    "main_boulevard",
    "standard",
  ]),
  plotCategoryId: z.string().min(1, "Plot category is required"),
  plotStreet: z.string().max(100, "Street name too long").optional(),
  plotLength: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, "Length must be greater than 0"),
  plotWidth: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, "Width must be greater than 0"),
  plotAreaUnit: z
    .enum(["sqft", "sqm", "marla", "kanal", "acre"])
    .optional()
    .default("sqft"),
  srDevStatId: z.string().optional(),
  salesStatusId: z.string().min(1, "Sales status is required"),
  surchargeAmount: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === "" ? 0 : Number(val)))
    .refine((val) => val >= 0, "Surcharge cannot be negative"),
  plotBasePrice: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => val >= 0, "Base price cannot be negative"),
  plotTotalAmount: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === "" ? undefined : Number(val)))
    .refine((val) => !val || val >= 0, "Total amount cannot be negative"),
  discountAmount: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === "" ? undefined : Number(val)))
    .refine((val) => val === undefined || val >= 0, "Discount cannot be negative"),
  discountDate: z.string().optional(),
  plotRemarks: z.string().max(1000, "Remarks too long").optional(),
  plotLatitude: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === "" ? undefined : Number(val)))
    .refine(
      (val) => !val || (val >= -90 && val <= 90),
      "Latitude must be between -90 and 90",
    ),
  plotLongitude: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === "" ? undefined : Number(val)))
    .refine(
      (val) => !val || (val >= -180 && val <= 180),
      "Longitude must be between -180 and 180",
    ),
});

export type PlotFormData = z.infer<typeof plotSchema>;
