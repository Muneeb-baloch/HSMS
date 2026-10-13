// src/lib/schemas/complaint.schema.ts
import { z } from "zod";

export const complaintSchema = z.object({
  memId: z
    .string()
    .min(1, "Member is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID"),

  fileId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid file ID")
    .optional()
    .or(z.literal("")),

  compCatId: z
    .string()
    .min(1, "Category is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),

  compTitle: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title cannot exceed 200 characters"),

  compDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description cannot exceed 5000 characters"),

  compPriority: z.enum(["low", "medium", "high", "emergency"], {
    required_error: "Priority is required",
  }),

  statusId: z
    .string()
    .min(1, "Status is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid status ID"),

  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid assignee ID")
    .optional()
    .or(z.literal("")),

  attachmentPaths: z.array(z.string().url()).optional().default([]),
});

export const updateComplaintSchema = complaintSchema.partial();

export type ComplaintFormData = z.infer<typeof complaintSchema>;
export type UpdateComplaintFormData = z.infer<typeof updateComplaintSchema>;
