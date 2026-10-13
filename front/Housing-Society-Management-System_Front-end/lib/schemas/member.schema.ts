// src/lib/schemas/member.schema.ts
import * as z from "zod";

export const memberSchema = z.object({
  // Required fields
  memName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  memNic: z.preprocess(
    (val) => (typeof val === "number" ? String(val) : val),
    z
      .string()
      .min(13, "NIC must be at least 13 characters")
      .max(15, "NIC too long"),
  ),
  memAddr1: z
    .string()
    .min(1, "Address Line 1 is required")
    .max(200, "Address too long"),
  memContMob: z.preprocess(
    (val) => (typeof val === "number" ? String(val) : val),
    z.string().min(1, "Mobile is required").max(20, "Mobile too long"),
  ),

  // Optional fields
  memFHName: z.string().max(100, "Too long").optional(),
  memFHRelation: z.enum(["father", "husband", "guardian"]).optional(),
  memAddr2: z.string().max(200, "Too long").optional(),
  memAddr3: z.string().max(200, "Too long").optional(),
  memContRes: z
    .preprocess(
      (val) => (typeof val === "number" ? String(val) : val),
      z.string().max(20, "Too long"),
    )
    .optional(),
  memContWork: z
    .preprocess(
      (val) => (typeof val === "number" ? String(val) : val),
      z.string().max(20, "Too long"),
    )
    .optional(),
  memContEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  memZipPost: z
    .preprocess(
      (val) => (typeof val === "number" ? String(val) : val),
      z.string().max(20, "Too long"),
    )
    .optional(),
  memRemarks: z.string().max(500, "Too long").optional(),
  memOccupation: z.string().max(100, "Too long").optional(),
  memPermAdd: z.string().max(500, "Too long").optional(),
  memPermAddress1: z.string().max(200, "Too long").optional(),
  memPermCity: z.string().max(50, "Too long").optional(),
  memPermState: z.string().max(50, "Too long").optional(),
  memPermCountry: z.string().max(50, "Too long").optional(),
  memState: z.string().max(50, "Too long").optional(),
  memCountry: z.string().max(50, "Too long").optional(),
  memImg: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  memCnicFront: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  memCnicBack: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  // Relationship fields
  statusId: z.string().optional(),
  cityId: z.string().optional(),

  // Boolean and enum fields
  memIsOverseas: z.boolean().default(false),
  gender: z.enum(["male", "female", "other"]).optional(),

  // Date field
  dateOfBirth: z.string().optional(),
});
export const memberImageSchema = z.object({
  memImg: z.string().url().optional().or(z.literal("")),
});
export type MemberFormData = z.infer<typeof memberSchema>;
