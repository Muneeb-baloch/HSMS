// src/lib/schemas/registry.schema.ts
import { z } from "zod";

export const registrySchema = z
  .object({
    memId: z
      .string()
      .min(1, "Member is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID"),
    plotId: z
      .string()
      .min(1, "Plot is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid plot ID"),
    registryNo: z
      .string()
      .min(3, "Registry number must be at least 3 characters")
      .max(100)
      .regex(/^[A-Z0-9\-_\/]+$/i, "Only letters, numbers, hyphens, underscores, slashes"),
    mutationNo: z
      .string()
      .min(3, "Mutation number must be at least 3 characters")
      .max(100)
      .regex(/^[A-Z0-9\-_\/]+$/i, "Only letters, numbers, hyphens, underscores, slashes"),
    mutationDate: z
      .string()
      .refine((v) => !v || !isNaN(Date.parse(v)), "Invalid date")
      .optional()
      .or(z.literal("")),
    areaKanal: z.coerce.number().min(0).max(1000).optional(),
    areaMarla: z.coerce.number().min(0).max(20000).optional(),
    areaSqft: z.coerce.number().min(0).max(1000000).optional(),
    mozaVillage: z.string().max(200).optional().or(z.literal("")),
    khasraNo: z.string().max(50).optional().or(z.literal("")),
    khewatNo: z.string().max(50).optional().or(z.literal("")),
    khatoniNo: z.string().max(50).optional().or(z.literal("")),
    legalOfficeDetails: z.string().max(1000).optional().or(z.literal("")),
    subRegistrarName: z.string().max(200).optional().or(z.literal("")),
    agreementDate: z
      .string()
      .refine((v) => !v || !isNaN(Date.parse(v)), "Invalid date")
      .optional()
      .or(z.literal("")),
    stampPaperNo: z.string().max(100).optional().or(z.literal("")),
    bookNo: z.string().max(50).optional().or(z.literal("")),
    volumeNo: z.string().max(50).optional().or(z.literal("")),
    documentNo: z.string().max(50).optional().or(z.literal("")),
    reportNo: z.string().max(100).optional().or(z.literal("")),
    scanCopyPath: z.string().url().optional().or(z.literal("")),
    landOwnerPhoto: z.string().url().optional().or(z.literal("")),
    remarks: z.string().max(1000).optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      (data.areaKanal ?? 0) > 0 || (data.areaMarla ?? 0) > 0 || (data.areaSqft ?? 0) > 0,
    { message: "At least one area measurement is required", path: ["areaKanal"] }
  );

export const updateRegistrySchema = registrySchema.partial();

export type RegistryFormData = z.infer<typeof registrySchema>;
