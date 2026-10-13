// src/lib/schemas/installmentPlan.schema.ts
import * as z from 'zod';

export const createInstallmentPlanSchema = z.object({
  projId: z.string().min(1, 'Project is required'),
  planName: z
    .string()
    .min(3, 'Plan name must be at least 3 characters')
    .max(100, 'Plan name cannot exceed 100 characters')
    .trim(),
  totalMonths: z
    .union([z.number().int().min(1).max(360), z.string()])
    .transform(val => Number(val)),
  totalAmount: z
    .union([z.number().min(0), z.string()])
    .transform(val => Number(val)),
  isActive: z.boolean().default(true),
});

export const updateInstallmentPlanSchema = createInstallmentPlanSchema.partial();

export type InstallmentPlanFormData = z.infer<typeof createInstallmentPlanSchema>;
export type UpdateInstallmentPlanFormData = z.infer<typeof updateInstallmentPlanSchema>;
