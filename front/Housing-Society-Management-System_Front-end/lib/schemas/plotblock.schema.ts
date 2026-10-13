// src/lib/schemas/plotblock.schema.ts
import * as z from "zod";

export const plotBlockSchema = z.object({
  projectId: z.string().min(1, "Project is required"), // Added
  plotBlockName: z
    .string()
    .min(2, "Plot Block name must be at least 2 characters")
    .max(100, "Plot Block name too long"),
  plotBlockDesc: z.string().max(500, "Description too long").optional(),
  blockTotalArea: z
    .union([z.number().min(0, "Area must be positive"), z.string()])
    .optional()
    .transform((val) => (val === "" ? undefined : Number(val))),
  blockAreaUnit: z.enum(["acres", "hectares", "sqft", "sqm", "km²", "marla", "kanal"]).optional(),
});

export type PlotBlockFormData = z.infer<typeof plotBlockSchema>;
