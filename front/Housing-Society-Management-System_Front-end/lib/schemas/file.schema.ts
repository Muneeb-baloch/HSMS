// src/lib/schemas/file.schema.ts
import { z } from "zod";

export const fileSchema = z
  .object({
    fileRegNo: z
      .string()
      .min(5, "File registration number must be at least 5 characters")
      .max(50, "File registration number cannot exceed 50 characters")
      .optional()
      .or(z.literal("")),

    fileBarCode: z
      .string()
      .min(1, "File barcode is required")
      .max(100, "File barcode cannot exceed 100 characters"),

    projId: z
      .string()
      .min(1, "Project is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID"),

    planId: z
      .string()
      .min(1, "Installment plan is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid installment plan ID"),

    memId: z
      .string()
      .min(1, "Member is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID"),

    nomineeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid nominee ID")
      .optional()
      .or(z.literal("")),

    applicationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid application ID")
      .optional()
      .or(z.literal("")),

    plotId: z
      .string()
      .min(1, "Plot is required - file must be associated with a plot")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid plot ID"),

    totalAmount: z.preprocess(
      (val) => (typeof val === "string" ? val.trim() : val),
      z
        .union([z.string(), z.number()])
        .refine(
          (val) => {
            const n = typeof val === "number" ? val : parseFloat(val);
            return !Number.isNaN(n) && n >= 0;
          },
          {
            message: "Total amount must be a positive number",
          },
        )
        .transform((val) => (typeof val === "number" ? val : parseFloat(val))),
    ),

    downPayment: z.preprocess(
      (val) => (typeof val === "string" ? val.trim() : val),
      z
        .union([z.string(), z.number()])
        .refine(
          (val) => {
            const n = typeof val === "number" ? val : parseFloat(val);
            return !Number.isNaN(n) && n >= 0;
          },
          {
            message: "Down payment must be a positive number",
          },
        )
        .transform((val) => (typeof val === "number" ? val : parseFloat(val))),
    ),

    paymentMode: z.string().min(1, "Payment mode is required"),

    isAdjusted: z.boolean().optional().default(false),

    adjustmentRef: z
      .string()
      .max(100, "Adjustment reference cannot exceed 100 characters")
      .optional()
      .or(z.literal("")),

    status: z.string().min(1, "Status is required"),

    fileRemarks: z
      .string()
      .max(1000, "Remarks cannot exceed 1000 characters")
      .optional()
      .or(z.literal("")),

    bookingDate: z
      .string()
      .min(1, "Booking date is required")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      }),

    expectedCompletionDate: z
      .string()
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.downPayment <= data.totalAmount, {
    message: "Down payment cannot exceed total amount",
    path: ["downPayment"],
  })
  .refine(
    (data) => {
      if (!data.plotId || data.plotId.trim() === "") {
        return false;
      }
      return true;
    },
    {
      message: "Plot is required - file must be associated with a plot",
      path: ["plotId"],
    },
  );

export const updateFileSchema = z
  .object({
    planId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid plan ID")
      .optional()
      .or(z.literal("")),

    nomineeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid nominee ID")
      .optional()
      .or(z.literal("")),

    fileBarCode: z
      .string()
      .max(100, "File barcode cannot exceed 100 characters")
      .optional()
      .or(z.literal("")),

    plotId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid plot ID")
      .optional()
      .or(z.literal("")),

    totalAmount: z
      .preprocess(
        (val) => (typeof val === "string" ? val.trim() : val),
        z.union([z.string(), z.number()]),
      )
      .refine(
        (val) => {
          if (val === "" || val === undefined) return true;
          const n = typeof val === "number" ? val : parseFloat(val);
          return !Number.isNaN(n) && n >= 0;
        },
        {
          message: "Total amount must be a positive number",
        },
      )
      .optional()
      .transform((val) => {
        if (val === "" || val === undefined) return undefined;
        return typeof val === "number" ? val : parseFloat(val);
      }),

    downPayment: z
      .preprocess(
        (val) => (typeof val === "string" ? val.trim() : val),
        z.union([z.string(), z.number()]),
      )
      .refine(
        (val) => {
          if (val === "" || val === undefined) return true;
          const n = typeof val === "number" ? val : parseFloat(val);
          return !Number.isNaN(n) && n >= 0;
        },
        {
          message: "Down payment must be a positive number",
        },
      )
      .optional()
      .transform((val) => {
        if (val === "" || val === undefined) return undefined;
        return typeof val === "number" ? val : parseFloat(val);
      }),

    paymentMode: z.string().optional(),

    isAdjusted: z.boolean().optional(),

    adjustmentRef: z
      .string()
      .max(100, "Adjustment reference cannot exceed 100 characters")
      .optional()
      .or(z.literal("")),

    status: z.string().optional(),

    fileRemarks: z
      .string()
      .max(1000, "Remarks cannot exceed 1000 characters")
      .optional()
      .or(z.literal("")),

    expectedCompletionDate: z
      .string()
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .optional()
      .or(z.literal("")),

    actualCompletionDate: z
      .string()
      .refine((val) => val === "" || !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .optional()
      .or(z.literal("")),

    cancellationReason: z
      .string()
      .max(500, "Cancellation reason cannot exceed 500 characters")
      .optional()
      .or(z.literal("")),

    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.downPayment !== undefined && data.totalAmount !== undefined) {
        return data.downPayment <= data.totalAmount;
      }
      return true;
    },
    {
      message: "Down payment cannot exceed total amount",
      path: ["downPayment"],
    },
  );

export type FileFormData = z.infer<typeof fileSchema>;
export type UpdateFileFormData = z.infer<typeof updateFileSchema>;
