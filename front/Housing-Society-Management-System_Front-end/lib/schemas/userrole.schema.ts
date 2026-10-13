// src/lib/schemas/userrole.schema.ts
import * as z from "zod";

export const userRoleSchema = z.object({
  roleName: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(100, "Role name cannot exceed 100 characters"),

  roleCode: z
    .string()
    .min(2, "Role code must be at least 2 characters")
    .max(50, "Role code cannot exceed 50 characters")
    .regex(
      /^[A-Z0-9_]+$/,
      "Role code must contain only uppercase letters, numbers, and underscores",
    )
    .transform((val) => val.toUpperCase()),

  roleDescription: z
    .string()
    .max(500, "Role description cannot exceed 500 characters")
    .optional(),

  isActive: z.boolean().default(true),

  priority: z.coerce
    .number()
    .min(0, "Priority must be at least 0")
    .max(1000, "Priority cannot exceed 1000")
    .default(0),
});

export type UserRoleFormData = z.infer<typeof userRoleSchema>;
