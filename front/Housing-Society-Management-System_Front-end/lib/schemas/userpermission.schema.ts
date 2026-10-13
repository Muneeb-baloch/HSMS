// src/lib/schemas/userpermission.schema.ts
import * as z from "zod";

export const userPermissionSchema = z
  .object({
    srModuleId: z.string().min(1, "Module is required"),
    roleId: z.string().min(1, "Role is required"),
    moduleName: z
      .string()
      .min(2, "Module name must be at least 2 characters")
      .optional(),

    // Permission flags
    canRead: z.boolean().default(false),
    canCreate: z.boolean().default(false),
    canUpdate: z.boolean().default(false),
    canDelete: z.boolean().default(false),
    canExport: z.boolean().default(false).optional(),
    canImport: z.boolean().default(false).optional(),
    canApprove: z.boolean().default(false).optional(),
    canVerify: z.boolean().default(false).optional(),

    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // At least one permission must be granted
      return (
        data.canRead ||
        data.canCreate ||
        data.canUpdate ||
        data.canDelete ||
        data.canExport ||
        data.canImport ||
        data.canApprove ||
        data.canVerify
      );
    },
    {
      message: "At least one permission must be granted",
      path: ["canRead"], // Focus on the first permission field
    },
  );

export type UserPermissionFormData = z.infer<typeof userPermissionSchema>;
