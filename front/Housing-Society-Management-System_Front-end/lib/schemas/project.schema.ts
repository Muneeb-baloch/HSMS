// src/lib/schemas/project.schema.ts
import * as z from "zod";

export const AREA_UNITS = [
  "acres",
  "hectares",
  "sqft",
  "sqm",
  "km²",
  "marla",
  "kanal",
] as const;

export const projectSchema = z
  .object({
    projName: z
      .string()
      .min(2, "Project name must be at least 2 characters")
      .max(200, "Project name too long"),

    projCode: z
      .string()
      .min(2, "Project code must be at least 2 characters")
      .max(20, "Project code too long")
      .optional()
      .transform((val) => val?.toUpperCase()),

    projLocation: z
      .string()
      .min(1, "Project location is required")
      .max(200, "Location too long"),

    projPrefix: z
      .string()
      .min(2, "Project prefix must be at least 2 characters")
      .max(10, "Project prefix too long")
      .transform((val) => val.toUpperCase()),

    projDescription: z.string().max(2000, "Description too long").optional(),

    totalArea: z
      .union([
        z.number().min(0.01, "Total area must be greater than 0"),
        z.string(),
      ])
      .transform((val) => Number(val)),

    areaUnit: z.enum(AREA_UNITS),

    launchDate: z
      .union([z.date(), z.string()])
      .refine((val) => {
        const date = new Date(val);
        return date <= new Date();
      }, "Launch date cannot be in the future")
      .transform((val) => new Date(val)),

    completionDate: z
      .union([z.date(), z.string()])
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),

    projStatus: z
      .enum([
        "planning",
        "under_development",
        "completed",
        "on_hold",
        "cancelled",
      ])
      .default("planning"),

    projType: z
      .enum([
        "residential",
        "commercial",
        "industrial",
        "mixed_use",
        "agricultural",
      ])
      .default("residential"),

    isActive: z.boolean().default(true),

    website: z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .or(z.literal("")),

    contactEmail: z
      .string()
      .email("Please enter a valid email")
      .optional()
      .or(z.literal("")),

    contactPhone: z
      .string()
      .regex(/^[+]?[0-9\s\-\(\)]{10,}$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),

    address: z.string().max(500, "Address too long").optional(),

    cityId: z.string().min(1, "City is required"),

    country: z.string().default("Pakistan"),

    amenities: z.array(z.string()).optional().default([]),

    coordinates: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.completionDate) {
        return data.completionDate >= data.launchDate;
      }
      return true;
    },
    {
      message: "Completion date must be after launch date",
      path: ["completionDate"],
    },
  );

export type ProjectFormData = z.infer<typeof projectSchema>;
