// src/lib/schemas/application.schema.ts
import { z } from "zod";

export const applicationSchema = z.object({
  applicationTypeID: z
    .string()
    .min(1, "Application type is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid application type ID"),

  memId: z
    .string()
    .min(1, "Member is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID"),

  plotId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid plot ID")
    .optional()
    .or(z.literal("")),

  applicationDate: z
    .string()
    .min(1, "Application date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),

  statusId: z
    .string()
    .min(1, "Status is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid status ID"),

  remarks: z
    .string()
    .max(1000, "Remarks cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),

  attachmentPath: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal("")),
});

export const updateApplicationSchema = z.object({
  applicationTypeID: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid application type ID")
    .optional(),

  memId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID")
    .optional(),

  plotId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid plot ID")
    .optional()
    .or(z.literal("")),

  applicationDate: z
    .string()
    .refine((val) => val === "" || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),

  statusId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid status ID")
    .optional(),

  remarks: z
    .string()
    .max(1000, "Remarks cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),

  attachmentPath: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal("")),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type UpdateApplicationFormData = z.infer<typeof updateApplicationSchema>;
