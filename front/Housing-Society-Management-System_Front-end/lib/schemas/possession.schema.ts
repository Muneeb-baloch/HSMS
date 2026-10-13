// src/lib/schemas/possession.schema.ts
import * as z from "zod";

export const possessionSchema = z.object({
  fileId: z.string().min(1, "File is required"),
  plotId: z.string().min(1, "Plot is required"),
  possessionInitDate: z.string().min(1, "Application Date is required"),
  possessionHandoverCSR: z.string().min(1, "Handover CSR is required"),
  possessionStatus: z.string().optional(),
  possessionSurveyPerson: z
    .string()
    .max(100, "Survey person name too long")
    .optional(),
  possessionSurveyDate: z.string().optional(),
  possessionCollectorName: z
    .string()
    .max(100, "Collector name too long")
    .optional(),
  possessionCollectorNic: z
    .string()
    .regex(
      /^\d{5}-\d{7}-\d{1}$|^\d{13}$/,
      "Please enter a valid CNIC (XXXXX-XXXXXXX-X or 13 digits)",
    )
    .optional(),
  possessionRemarks: z.string().max(1000, "Remarks too long").optional(),
  possessionSurveyRemarks: z
    .string()
    .max(500, "Survey remarks too long")
    .optional(),
  possessionHandoverRemarks: z
    .string()
    .max(500, "Handover remarks too long")
    .optional(),
  possessionLatitude: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === "" ? undefined : Number(val))),
  possessionLongitude: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === "" ? undefined : Number(val))),
});

export type PossessionFormData = z.infer<typeof possessionSchema>;
