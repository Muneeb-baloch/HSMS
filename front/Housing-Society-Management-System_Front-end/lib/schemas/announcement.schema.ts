import { z } from "zod";

export const announcementSchema = z.object({
  authorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid author ID"),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
  title: z.string().min(5).max(200),
  announcementDesc: z.string().min(10).max(5000),
  shortDescription: z.string().max(500).optional().or(z.literal("")),
  targetType: z.enum(["All", "Block", "Project", "Individual"]),
  targetGroupId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .or(z.literal("")),
  priorityLevel: z.coerce.number().int().min(1).max(3),
  attachmentURL: z.string().url().optional().or(z.literal("")),
  expiresAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" })
    .optional(),
});

export const updateAnnouncementSchema = announcementSchema.partial();

export type AnnouncementFormData = z.infer<typeof announcementSchema>;
export type UpdateAnnouncementFormData = z.infer<
  typeof updateAnnouncementSchema
>;
