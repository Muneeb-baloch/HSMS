// src/lib/schemas/nominee.schema.ts
import { z } from "zod";
import { RelationType } from "../types/nominee";

export const nomineeSchema = z.object({
  memId: z.string().min(1, "Member is required"),
  nomineeName: z
    .string()
    .min(2, "Nominee name must be at least 2 characters")
    .max(100, "Nominee name cannot exceed 100 characters"),
  nomineeCNIC: z
    .string()
    .regex(
      /^\d{5}-\d{7}-\d{1}$|^\d{13}$/,
      "Please enter a valid CNIC (XXXXX-XXXXXXX-X or 13 digits)",
    ),
  relationWithMember: z.nativeEnum(RelationType),
  nomineeContact: z
    .string()
    .regex(/^[0-9]{11,15}$/, "Invalid contact number. Should be 11-15 digits"),
  nomineeEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  nomineeAddress: z
    .string()
    .max(500, "Address cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  nomineeSharePercentage: z.coerce
    .number()
    .min(0, "Share percentage cannot be negative")
    .max(100, "Share percentage cannot exceed 100%")
    .default(100),
  nomineePhoto: z.string().optional(),
});

export const updateNomineeSchema = z.object({
  nomineeName: z
    .string()
    .min(2, "Nominee name must be at least 2 characters")
    .max(100, "Nominee name cannot exceed 100 characters")
    .optional(),
  nomineeCNIC: z
    .string()
    .regex(
      /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
      "Invalid CNIC format. Should be XXXXX-XXXXXXX-X",
    )
    .optional(),
  relationWithMember: z.nativeEnum(RelationType).optional(),
  nomineeContact: z
    .string()
    .regex(/^[0-9]{11,15}$/, "Invalid contact number. Should be 11-15 digits")
    .optional(),
  nomineeEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  nomineeAddress: z
    .string()
    .max(500, "Address cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  nomineeSharePercentage: z.coerce
    .number()
    .min(0, "Share percentage cannot be negative")
    .max(100, "Share percentage cannot exceed 100%")
    .optional(),
  nomineePhoto: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type NomineeFormData = z.infer<typeof nomineeSchema>;
export type UpdateNomineeFormData = z.infer<typeof updateNomineeSchema>;
