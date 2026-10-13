// src/lib/schemas/installment.schema.ts
import { z } from "zod";
import {
  InstallmentStatus,
  InstallmentType,
  PaymentMode,
} from "../types/installment";

export const installmentSchema = z.object({
  planId: z.string().optional(),
  fileId: z.string().optional(),
  memId: z.string().min(1, "Member is required"),
  plotId: z.string().min(1, "Plot is required"),
  installmentCategoryId: z.string().min(1, "Installment category is required"),
  installmentNo: z.coerce
    .number()
    .min(1, "Installment number must be at least 1")
    .optional(),
  installmentTitle: z
    .string()
    .min(2, "Installment title must be at least 2 characters")
    .max(200, "Installment title cannot exceed 200 characters"),
  installmentType: z.nativeEnum(InstallmentType),
  dueDate: z.coerce.date().min(new Date(), "Due date cannot be in the past"),
  amountDue: z.coerce.number().min(0, "Amount due must be positive"),
  lateFeeSurcharge: z.coerce
    .number()
    .min(0, "Late fee surcharge cannot be negative")
    .optional()
    .default(0),
  installmentRemarks: z
    .string()
    .max(1000, "Remarks cannot exceed 1000 characters")
    .optional(),
});

export const bulkInstallmentSchema = z.object({
  fileId: z.string().min(1, "File is required"),
  memId: z.string().min(1, "Member is required"),
  plotId: z.string().min(1, "Plot is required"),
  installmentCategoryId: z.string().min(1, "Installment category is required"),
  installmentType: z.nativeEnum(InstallmentType),
  totalInstallments: z.coerce
    .number()
    .min(1, "Total installments must be at least 1")
    .max(360, "Total installments cannot exceed 360"),
  amountPerInstallment: z.coerce
    .number()
    .min(0, "Amount per installment must be positive"),
  startDate: z.coerce.date().min(new Date(), "Start date cannot be in the past"),
  frequency: z.enum(["monthly", "quarterly", "half-yearly", "yearly"]),
  installmentTitle: z
    .string()
    .max(200, "Installment title cannot exceed 200 characters")
    .optional(),
});

export const updateInstallmentSchema = z.object({
  installmentNo: z.coerce
    .number()
    .min(1, "Installment number must be at least 1")
    .optional(),
  installmentTitle: z
    .string()
    .min(2, "Installment title must be at least 2 characters")
    .max(200, "Installment title cannot exceed 200 characters")
    .optional(),
  installmentType: z.nativeEnum(InstallmentType).optional(),
  dueDate: z.coerce.date().optional(),
  amountDue: z.coerce.number().min(0, "Amount due must be positive").optional(),
  lateFeeSurcharge: z.coerce
    .number()
    .min(0, "Late fee surcharge cannot be negative")
    .optional(),
  amountPaid: z.coerce
    .number()
    .min(0, "Amount paid must be positive")
    .optional(),
  paidDate: z.coerce.date().optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  transactionRefNo: z
    .string()
    .max(100, "Transaction reference cannot exceed 100 characters")
    .optional(),
  status: z.nativeEnum(InstallmentStatus).optional(),
  installmentRemarks: z
    .string()
    .max(1000, "Remarks cannot exceed 1000 characters")
    .optional(),
});

export const paymentSchema = z.object({
  amountPaid: z.coerce
    .number()
    .min(0.01, "Payment amount must be at least 0.01"),
  paidDate: z.coerce.date().max(new Date(), "Payment date cannot be in the future"),
  paymentMode: z.nativeEnum(PaymentMode),
  transactionRefNo: z
    .string()
    .max(100, "Transaction reference cannot exceed 100 characters")
    .optional(),
  remarks: z
    .string()
    .max(500, "Remarks cannot exceed 500 characters")
    .optional(),
});

export type InstallmentFormData = z.infer<typeof installmentSchema>;
export type BulkInstallmentFormData = z.infer<typeof bulkInstallmentSchema>;
export type UpdateInstallmentFormData = z.infer<typeof updateInstallmentSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
