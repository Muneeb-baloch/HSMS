// src/lib/schemas/state.schema.ts
import * as z from "zod";

export const statusSchema = z.object({
  statusName: z
    .string()
    .min(2, "Status name must be at least 2 characters")
    .max(100, "Status name too long"),
  statusDescription: z.string().max(500, "Description too long").optional(),
});

export type StatusFormData = z.infer<typeof statusSchema>;
