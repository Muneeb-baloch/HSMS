import * as z from 'zod';

export const createInstallmentPlanDetailSchema = z
  .object({
    planId: z.string().min(1, 'Plan is required'),
    instCatId: z.string().min(1, 'Installment category is required'),
    occurrence: z
      .union([z.number().int().min(1), z.string()])
      .transform((val) => Number(val)),
    percentageAmount: z
      .union([z.number().min(0).max(100), z.string()])
      .optional()
      .transform((val) => (val === '' || val === undefined ? 0 : Number(val))),
    fixedAmount: z
      .union([z.number().min(0), z.string()])
      .optional()
      .transform((val) => (val === '' || val === undefined ? 0 : Number(val))),
  })
  .refine(
    (data) => (data.percentageAmount ?? 0) > 0 || (data.fixedAmount ?? 0) > 0,
    {
      message: 'At least one of percentage or fixed amount must be greater than 0',
      path: ['percentageAmount'],
    }
  );

export const updateInstallmentPlanDetailSchema = z
  .object({
    occurrence: z
      .union([z.number().int().min(1), z.string()])
      .optional()
      .transform((val) => (val === undefined ? undefined : Number(val))),
    percentageAmount: z
      .union([z.number().min(0).max(100), z.string()])
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : Number(val))),
    fixedAmount: z
      .union([z.number().min(0), z.string()])
      .optional()
      .transform((val) => (val === '' || val === undefined ? undefined : Number(val))),
  })
  .refine(
    (data) => {
      const pct = data.percentageAmount;
      const fixed = data.fixedAmount;
      if (pct === undefined && fixed === undefined) return true;
      return (pct ?? 0) > 0 || (fixed ?? 0) > 0;
    },
    {
      message: 'At least one of percentage or fixed amount must be greater than 0',
      path: ['percentageAmount'],
    }
  );

export type InstallmentPlanDetailFormData = z.infer<
  typeof createInstallmentPlanDetailSchema
>;
export type UpdateInstallmentPlanDetailFormData = z.infer<
  typeof updateInstallmentPlanDetailSchema
>;
