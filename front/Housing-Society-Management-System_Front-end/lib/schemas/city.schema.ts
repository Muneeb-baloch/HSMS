// src/lib/schemas/city.schema.ts
import * as z from "zod";

export const citySchema = z.object({
  cityName: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name too long"),
  cityDescription: z.string().max(500, "Description too long").optional(),
  stateId: z.string().min(1, "State is required"),
  statusId: z.string().optional(),
});

export type CityFormData = z.infer<typeof citySchema>;
