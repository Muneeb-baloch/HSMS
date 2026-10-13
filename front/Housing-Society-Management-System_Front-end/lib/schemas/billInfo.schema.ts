import { z } from "zod";

const MONTH_YEAR_REGEX = /^[A-Za-z]+ \d{4}$/;

export const billInfoSchema = z.object({
  memId: z
    .string()
    .min(1, "Member is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID"),
  fileId: z
    .string()
    .min(1, "File is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid file ID"),
  billTypeId: z
    .string()
    .min(1, "Bill type is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid bill type ID"),
  billMonth: z
    .string()
    .min(1, "Bill month is required")
    .regex(MONTH_YEAR_REGEX, 'Format: "Month Year" (e.g., January 2026)'),
  billAmount: z.coerce.number().min(0, "Bill amount must be positive"),
  fineAmount: z.coerce.number().min(0).optional().default(0),
  arrears: z.coerce.number().min(0).optional().default(0),
  dueDate: z.string().min(1, "Due date is required"),
  gracePeriodDays: z.coerce.number().min(0).max(30).optional().default(7),
  notes: z.string().max(1000).optional(),
  previousReading: z.coerce.number().min(0).optional(),
  currentReading: z.coerce.number().min(0).optional(),
  attachmentPaths: z.array(z.string().url()).optional().default([]),
});

export const updateBillInfoSchema = billInfoSchema.partial();

export type BillInfoFormData = z.infer<typeof billInfoSchema>;
