// src/lib/schemas/userstaff.schema.ts
import * as z from "zod";

export const userStaffSchema = z.object({
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username can only contain letters, numbers, dots and underscores",
    )
    .transform((val) => val.toLowerCase()),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),

  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),

  cnic: z
    .string()
    .regex(
      /^\d{5}-\d{7}-\d{1}$/,
      "Please provide a valid CNIC (XXXXX-XXXXXXX-X)",
    ),

  mobileNo: z
    .string()
    .regex(/^\+?[\d\s-]{10,}$/, "Please provide a valid mobile number")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Please provide a valid email")
    .optional()
    .or(z.literal("")),

  roleId: z.string().min(1, "Role is required"),

  cityId: z.string().min(1, "City is required"),

  designation: z
    .string()
    .max(100, "Designation cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().default(true),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type UserStaffFormData = z.infer<typeof userStaffSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
