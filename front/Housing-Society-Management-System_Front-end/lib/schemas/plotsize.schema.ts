// src/lib/schemas/plotsize.schema.ts
import * as z from "zod";

export const AREA_UNITS = [
  "marla",
  "sqft",
  "sqm",
  "acre",
  "hectare",
  "kanal",
] as const;

export const plotSizeSchema = z
  .object({
    projectId: z
      .string()
      .min(1, "Project is required"),

    plotSizeName: z
      .string()
      .min(2, "Plot size name must be at least 2 characters")
      .max(100, "Plot size name too long"),

    totalArea: z
      .union([
        z.number().min(0.01, "Total area must be greater than 0"),
        z.string(),
      ])
      .transform((val) => Number(val)),

    areaUnit: z.enum(AREA_UNITS),

    sizeLength: z
      .union([
        z.number().min(0.01, "Length must be greater than 0"),
        z.string(),
      ])
      .transform((val) => Number(val)),

    sizeWidth: z
      .union([
        z.number().min(0.01, "Width must be greater than 0"),
        z.string(),
      ])
      .transform((val) => Number(val)),

    ratePerUnit: z
      .union([
        z.number().min(0, "Rate per unit cannot be negative"),
        z.string(),
      ])
      .transform((val) => Number(val)),

    standardBasePrice: z
      .union([z.number().min(0, "Price cannot be negative"), z.string()])
      .optional()
      .transform((val) => (val === undefined ? undefined : Number(val))),
  })
  .refine(
    (data) => {
      // Calculate price if not provided
      if (data.standardBasePrice === undefined) {
        return true; // Will be calculated on backend
      }
      const calculatedPrice = data.totalArea * data.ratePerUnit;
      return Math.abs(data.standardBasePrice - calculatedPrice) < 0.01; // Allow small rounding differences
    },
    {
      message:
        "Standard base price does not match calculated price (Area × Rate Per Unit)",
      path: ["standardBasePrice"],
    },
  );

export type PlotSizeFormData = z.infer<typeof plotSizeSchema>;
