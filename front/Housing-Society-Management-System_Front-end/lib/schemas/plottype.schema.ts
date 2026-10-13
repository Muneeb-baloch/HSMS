// src/lib/schemas/plotsize.schema.ts
import * as z from "zod";

export const plotTypeSchema = z.object({
  plotTypeName: z
    .string()
    .min(1, "Plot Type name must be at least 1 character")
    .max(50, "Plot Type name too long"),
});

export type PlotTypeFormData = z.infer<typeof plotTypeSchema>;
