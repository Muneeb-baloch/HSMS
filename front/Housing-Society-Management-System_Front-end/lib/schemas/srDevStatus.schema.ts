// src/lib/schemas/srDevStatus.schema.ts
import { DevCategory, DevPhase } from "@/lib/types/srdevstatus";
import * as z from "zod";

export const devCategoryEnum = Object.values(DevCategory);
export const devPhaseEnum = Object.values(DevPhase);

export const srDevStatusSchema = z
  .object({
    srDevStatName: z
      .string()
      .min(2, "Status name must be at least 2 characters")
      .max(100, "Status name too long"),

    srDevStatCode: z
      .string()
      .min(2, "Status code must be at least 2 characters")
      .max(20, "Status code too long")
      .transform((val) => val.toUpperCase()),

    devCategory: z.enum(devCategoryEnum as [string, ...string[]]),

    devPhase: z.nativeEnum(DevPhase),

    description: z.string().max(500, "Description too long").optional(),

    isActive: z.boolean().default(true),

    isDefault: z.boolean().default(false),

    colorCode: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color code")
      .default("#808080"),

    icon: z.string().max(50, "Icon name too long").optional(),

    requiresDocumentation: z.boolean().default(false),

    allowedTransitions: z.array(z.string()).optional(),
  });

export const statusTransitionSchema = z.object({
  currentStatusId: z.string().min(1, "Current status is required"),
  targetStatusId: z.string().min(1, "Target status is required"),
  projectId: z.string().optional(),
  remarks: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

export const bulkUpdateSchema = z.object({
  statusIds: z.array(z.string()).min(1, "At least one status is required"),
  field: z.enum(["isActive", "requiresDocumentation"]),
  value: z.boolean(),
});

export const projectProgressSchema = z.object({
  statusIds: z.array(z.string()).min(1, "At least one status is required"),
});

export type SrDevStatusFormData = z.infer<typeof srDevStatusSchema>;
export type StatusTransitionData = z.infer<typeof statusTransitionSchema>;
export type BulkUpdateData = z.infer<typeof bulkUpdateSchema>;
export type ProjectProgressData = z.infer<typeof projectProgressSchema>;
