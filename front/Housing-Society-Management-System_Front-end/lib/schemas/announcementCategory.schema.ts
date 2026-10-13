// src/lib/schemas/announcementCategory.schema.ts
import { z } from "zod";

export const announcementCategorySchema = z.object({
  categoryName: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Only letters, numbers, spaces, hyphens and underscores allowed",
    ),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),

  icon: z
    .string()
    .max(50, "Icon cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),

  color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Please provide a valid hex color",
    )
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().optional().default(true),

  priority: z.number().int().min(0).max(1000).optional().default(0),
});

export const updateAnnouncementCategorySchema =
  announcementCategorySchema.partial();

export type AnnouncementCategoryFormData = z.infer<
  typeof announcementCategorySchema
>;
export type UpdateAnnouncementCategoryFormData = z.infer<
  typeof updateAnnouncementCategorySchema
>;
