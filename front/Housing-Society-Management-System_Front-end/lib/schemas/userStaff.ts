import * as z from "zod";

export const userStaffSchema = z.object({
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name too long"),
  cnic: z.string().min(5, "CNIC is required").max(20, "CNIC too long"),
  mobileNo: z.string().max(20, "Mobile number too long").optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  roleId: z.string().min(1, "Role is required"),
  cityId: z.string().min(1, "City is required"),
  designation: z.string().max(100, "Designation too long").optional(),
  isActive: z.boolean().default(true),
});

export type UserStaffFormData = z.infer<typeof userStaffSchema>;
