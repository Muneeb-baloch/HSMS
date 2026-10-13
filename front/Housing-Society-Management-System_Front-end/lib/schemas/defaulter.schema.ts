import { z } from "zod";

export const defaulterSchema = z.object({
  memId: z
    .string()
    .min(1, "Member is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID"),
  plotId: z
    .string()
    .min(1, "Plot is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid plot ID"),
  fileId: z
    .string()
    .min(1, "File is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid file ID"),
  totalOverdueAmount: z.coerce.number().min(0, "Amount must be 0 or greater"),
  lastPaymentDate: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), "Invalid date")
    .optional()
    .or(z.literal("")),
  noticeSentCount: z.coerce.number().min(0).optional(),
  remarks: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(["Warning", "Suspended", "Legal Action", "Resolved"]).optional(),
});

export const updateDefaulterSchema = defaulterSchema.partial();

export type DefaulterFormData = z.infer<typeof defaulterSchema>;
