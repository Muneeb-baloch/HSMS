import { z } from "zod";

const categories = [
  "Utility",
  "Administrative",
  "Penalty",
  "Tax",
  "Fee",
  "Other",
] as const;
const calculationMethods = ["FIXED", "PER_UNIT", "PERCENTAGE", "TIERED"] as const;

export const billTypeSchema = z.object({
  billTypeName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  billTypeCategory: z.enum(categories, {
    required_error: "Category is required",
  }),
  defaultAmount: z.coerce.number().min(0).optional(),
  calculationMethod: z.enum(calculationMethods).optional().nullable(),
  isRecurring: z.boolean(),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
});

export type BillTypeFormData = z.infer<typeof billTypeSchema>;
