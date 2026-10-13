// src/lib/schemas/state.schema.ts
import * as z from "zod";

export const stateSchema = z.object({
  stateName: z
    .string()
    .min(2, "State name must be at least 2 characters")
    .max(100, "State name too long"),
  stateDescription: z.string().max(500, "Description too long").optional(),
  statusId: z.string().optional(),
});

export type StateFormData = z.infer<typeof stateSchema>;
