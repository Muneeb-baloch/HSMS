// src/lib/constants/roles.ts
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MODERATOR = "moderator",
  USER = "user",
  GUEST = "guest",
}

export const ROLES_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.MODERATOR]: 3,
  [UserRole.USER]: 2,
  [UserRole.GUEST]: 1,
};

export const hasPermission = (
  userRole: UserRole,
  requiredRole: UserRole | UserRole[]
): boolean => {
  const requiredRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];
  const userLevel = ROLES_HIERARCHY[userRole];

  return requiredRoles.some((role) => userLevel >= ROLES_HIERARCHY[role]);
};

// Role-based action permissions
export const PERMISSIONS = {
  MEMBER: {
    CREATE: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    READ: [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
    UPDATE: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    DELETE: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  // Add other entities here
} as const;
