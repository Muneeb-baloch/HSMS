import { AccessType, UserPermission } from "@/lib/types/permissions";

/**
 * Determine the access type based on permissions
 */
export const getAccessType = (permission: UserPermission): string => {
  if (!permission.canRead) {
    return AccessType.NO_ACCESS;
  }

  if (
    permission.canRead &&
    permission.canCreate &&
    permission.canUpdate &&
    permission.canDelete
  ) {
    return AccessType.FULL_ACCESS;
  }

  if (
    permission.canRead &&
    (permission.canCreate || permission.canUpdate || permission.canDelete)
  ) {
    return AccessType.LIMITED_ACCESS;
  }

  return AccessType.VIEW_ONLY;
};

/**
 * Get badge color for access type
 */
export const getAccessTypeBadgeColor = (accessType: string): string => {
  switch (accessType) {
    case AccessType.FULL_ACCESS:
      return "bg-green-100 text-green-800";
    case AccessType.LIMITED_ACCESS:
      return "bg-blue-100 text-blue-800";
    case AccessType.VIEW_ONLY:
      return "bg-yellow-100 text-yellow-800";
    case AccessType.NO_ACCESS:
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get permission level text
 */
export const getPermissionLevel = (permission: UserPermission): string => {
  const permissions: string[] = [];

  if (permission.canRead) permissions.push("Read");
  if (permission.canCreate) permissions.push("Create");
  if (permission.canUpdate) permissions.push("Update");
  if (permission.canDelete) permissions.push("Delete");
  if (permission.canExport) permissions.push("Export");
  if (permission.canImport) permissions.push("Import");
  if (permission.canApprove) permissions.push("Approve");
  if (permission.canVerify) permissions.push("Verify");

  if (permissions.length === 0) return "No Access";
  if (permissions.length === 8) return "Full Access";

  return permissions.join(", ");
};

/**
 * Calculate permission score (for sorting)
 */
export const getPermissionScore = (permission: UserPermission): number => {
  let score = 0;

  if (permission.canRead) score += 1;
  if (permission.canCreate) score += 2;
  if (permission.canUpdate) score += 2;
  if (permission.canDelete) score += 3;
  if (permission.canExport) score += 1;
  if (permission.canImport) score += 2;
  if (permission.canApprove) score += 3;
  if (permission.canVerify) score += 3;

  return score;
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  permission: UserPermission,
  permissionType:
    | "read"
    | "create"
    | "update"
    | "delete"
    | "export"
    | "import"
    | "approve"
    | "verify",
): boolean => {
  const permissionMap: Record<string, boolean> = {
    read: permission.canRead,
    create: permission.canCreate,
    update: permission.canUpdate,
    delete: permission.canDelete,
    export: permission.canExport || false,
    import: permission.canImport || false,
    approve: permission.canApprove || false,
    verify: permission.canVerify || false,
  };

  return permissionMap[permissionType] || false;
};

/**
 * Get list of granted permissions
 */
export const getGrantedPermissions = (permission: UserPermission): string[] => {
  const permissions: string[] = [];

  if (permission.canRead) permissions.push("Read");
  if (permission.canCreate) permissions.push("Create");
  if (permission.canUpdate) permissions.push("Update");
  if (permission.canDelete) permissions.push("Delete");
  if (permission.canExport) permissions.push("Export");
  if (permission.canImport) permissions.push("Import");
  if (permission.canApprove) permissions.push("Approve");
  if (permission.canVerify) permissions.push("Verify");

  return permissions;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format module name for display
 */
export const formatModuleName = (moduleName: string): string => {
  return moduleName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Format role name for display
 */
export const formatRoleName = (roleName: string): string => {
  return roleName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Check if permission is full access
 */
export const isFullAccess = (permission: UserPermission): boolean => {
  return (
    permission.canRead &&
    permission.canCreate &&
    permission.canUpdate &&
    permission.canDelete
  );
};

/**
 * Check if permission is read only
 */
export const isReadOnly = (permission: UserPermission): boolean => {
  return (
    permission.canRead &&
    !permission.canCreate &&
    !permission.canUpdate &&
    !permission.canDelete
  );
};

/**
 * Check if permission is limited access
 */
export const isLimitedAccess = (permission: UserPermission): boolean => {
  return (
    permission.canRead &&
    (permission.canCreate || permission.canUpdate || permission.canDelete) &&
    !(
      permission.canRead &&
      permission.canCreate &&
      permission.canUpdate &&
      permission.canDelete
    )
  );
};

/**
 * Filter permissions by access type
 */
export const filterPermissionsByAccessType = (
  permissions: UserPermission[],
  accessType: string,
): UserPermission[] => {
  return permissions.filter((p) => getAccessType(p) === accessType);
};

/**
 * Sort permissions by access level
 */
export const sortPermissionsByAccessLevel = (
  permissions: UserPermission[],
): UserPermission[] => {
  return [...permissions].sort(
    (a, b) => getPermissionScore(b) - getPermissionScore(a),
  );
};

/**
 * Group permissions by role
 */
export const groupPermissionsByRole = (
  permissions: UserPermission[],
): Record<string, UserPermission[]> => {
  return permissions.reduce(
    (acc, permission) => {
      const roleName =
        typeof permission.roleId === "string"
          ? "Unknown"
          : permission.roleId.roleName;
      if (!acc[roleName]) {
        acc[roleName] = [];
      }
      acc[roleName].push(permission);
      return acc;
    },
    {} as Record<string, UserPermission[]>,
  );
};

/**
 * Group permissions by module
 */
export const groupPermissionsByModule = (
  permissions: UserPermission[],
): Record<string, UserPermission[]> => {
  return permissions.reduce(
    (acc, permission) => {
      const moduleName =
        typeof permission.srModuleId === "string"
          ? permission.moduleName
          : permission.srModuleId.moduleName;
      if (!acc[moduleName]) {
        acc[moduleName] = [];
      }
      acc[moduleName].push(permission);
      return acc;
    },
    {} as Record<string, UserPermission[]>,
  );
};

/**
 * Merge permissions (for copying)
 */
export const mergePermissions = (
  ...permissions: Partial<UserPermission>[]
): Partial<UserPermission> => {
  const merged: Partial<UserPermission> = {};

  permissions.forEach((perm) => {
    merged.canRead = merged.canRead || perm.canRead;
    merged.canCreate = merged.canCreate || perm.canCreate;
    merged.canUpdate = merged.canUpdate || perm.canUpdate;
    merged.canDelete = merged.canDelete || perm.canDelete;
    merged.canExport = merged.canExport || perm.canExport;
    merged.canImport = merged.canImport || perm.canImport;
    merged.canApprove = merged.canApprove || perm.canApprove;
    merged.canVerify = merged.canVerify || perm.canVerify;
  });

  return merged;
};
