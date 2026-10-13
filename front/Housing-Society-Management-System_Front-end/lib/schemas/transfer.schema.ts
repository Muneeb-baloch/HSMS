import * as z from "zod";

export const transferSchema = z.object({
  fileId: z.string().min(1, "File is required"),
  transferTypeId: z.string().min(1, "Transfer type is required"),
  sellerMemId: z.string().min(1, "Seller is required"),
  buyerMemId: z.string().min(1, "Buyer is required"),
  transferInitDate: z.string().min(1, "Transfer initiation date is required"),

  applicationId: z.string().optional(),
  ndcDocPath: z.string().max(500, "Must be a valid URL or path").optional(),
  transferFeeAmount: z
    .number()
    .min(0, "Fee amount cannot be negative")
    .optional(),

  witness1Name: z.string().max(100, "Too long").optional(),
  witness1CNIC: z
    .string()
    .regex(
      /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
      "Invalid CNIC format (XXXXX-XXXXXXX-X)",
    )
    .optional(),
  witness2Name: z.string().max(100, "Too long").optional(),
  witness2CNIC: z
    .string()
    .regex(
      /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
      "Invalid CNIC format (XXXXX-XXXXXXX-X)",
    )
    .optional(),

  transfIsAtt: z.boolean().default(false),
  transfClearanceCertPath: z.string().max(500, "Too long").optional(),
  nomineeId: z.string().optional(),
  remarks: z.string().max(1000, "Too long").optional(),
  legalReviewNotes: z.string().max(2000, "Too long").optional(),
  cancellationReason: z.string().max(500, "Too long").optional(),

  status: z
    .enum([
      "Pending",
      "Under Review",
      "Approved",
      "Rejected",
      "Completed",
      "Cancelled",
      "On Hold",
      "Documents Required",
      "Fee Pending",
    ])
    .optional(),

  transferFeePaid: z.boolean().default(false),
  transferFeePaidDate: z.string().optional(),

  transferExecutionDate: z.string().optional(),

  officerName: z.string().max(100, "Too long").optional(),
  officerDesignation: z.string().max(100, "Too long").optional(),
  isActive: z.boolean().default(true),
});

export const feePaymentSchema = z.object({
  amount: z.number().min(1, "Amount is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Cheque", "Online Payment"]),
  transactionId: z.string().optional(),
  receiptNumber: z.string().optional(),
});

export const executeTransferSchema = z.object({
  executionDate: z.string().min(1, "Execution date is required"),
  witness1Name: z
    .string()
    .min(2, "Witness name is required")
    .max(100, "Too long"),
  witness1CNIC: z
    .string()
    .regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, "Invalid CNIC format"),
  witness2Name: z.string().optional(),
  witness2CNIC: z
    .string()
    .regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, "Invalid CNIC format")
    .optional(),
  officerName: z
    .string()
    .min(2, "Officer name is required")
    .max(100, "Too long"),
  officerDesignation: z
    .string()
    .min(2, "Officer designation is required")
    .max(100, "Too long"),
  remarks: z.string().max(1000, "Too long").optional(),
});

export type TransferFormData = z.infer<typeof transferSchema>;
export type FeePaymentFormData = z.infer<typeof feePaymentSchema>;
export type ExecuteTransferFormData = z.infer<typeof executeTransferSchema>;
