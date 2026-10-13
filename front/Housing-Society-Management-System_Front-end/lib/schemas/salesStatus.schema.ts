// src/lib/schemas/salesStatus.schema.ts
import * as z from "zod";

export const salesStatusTypeEnum = [
  "available",
  "booked",
  "reserved",
  "allotted",
  "contracted",
  "cancelled",
  "on_hold",
  "sold",
  "pending",
  "closed",
] as const;

export const salesStatusSchema = z.object({
  statusName: z
    .string()
    .min(2, "Status name must be at least 2 characters")
    .max(50, "Status name too long"),

  statusCode: z
    .string()
    .min(2, "Status code must be at least 2 characters")
    .max(20, "Status code too long")
    .transform((val) => val.toUpperCase()),

  statusType: z.enum(salesStatusTypeEnum),

  description: z.string().max(500, "Description too long").optional(),

  colorCode: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color code")
    .default("#808080"),

  isActive: z.boolean().default(true),

  isDefault: z.boolean().default(false),

  sequence: z
    .union([z.number().min(1, "Sequence must be at least 1"), z.string()])
    .transform((val) => Number(val))
    .default(1),

  allowsSale: z.boolean().default(false),

  requiresApproval: z.boolean().default(false),

  notificationTemplate: z.string().max(1000, "Template too long").optional(),
});

export const statusTransitionSchema = z.object({
  currentStatusId: z.string().min(1, "Current status is required"),
  targetStatusId: z.string().min(1, "Target status is required"),
});

export const bulkUpdateSchema = z.object({
  statusIds: z.array(z.string()).min(1, "At least one status is required"),
  field: z.enum(["isActive", "allowsSale", "requiresApproval"]),
  value: z.boolean(),
});

export type SalesStatusFormData = z.infer<typeof salesStatusSchema>;
export type StatusTransitionData = z.infer<typeof statusTransitionSchema>;
export type BulkUpdateData = z.infer<typeof bulkUpdateSchema>;
