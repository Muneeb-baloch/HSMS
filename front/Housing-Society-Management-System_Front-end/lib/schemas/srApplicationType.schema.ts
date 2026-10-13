// src/lib/schemas/srApplicationType.schema.ts
import { z } from "zod";

export const srApplicationTypeSchema = z.object({
  applicationName: z
    .string()
    .min(2, "Application name must be at least 2 characters")
    .max(100, "Application name cannot exceed 100 characters"),
  applicationDesc: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  applicationFee: z.coerce
    .number()
    .min(0, "Application fee cannot be negative")
    .max(1000000, "Application fee is too high"),
});

export const updateSrApplicationTypeSchema = z.object({
  applicationName: z
    .string()
    .min(2, "Application name must be at least 2 characters")
    .max(100, "Application name cannot exceed 100 characters")
    .optional(),
  applicationDesc: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  applicationFee: z.coerce
    .number()
    .min(0, "Application fee cannot be negative")
    .max(1000000, "Application fee is too high")
    .optional(),
});

export type SrApplicationTypeFormData = z.infer<typeof srApplicationTypeSchema>;
export type UpdateSrApplicationTypeFormData = z.infer<
  typeof updateSrApplicationTypeSchema
>;
