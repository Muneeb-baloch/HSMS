import { RoleLevel, UserRoleType } from "@/lib/types/userrole";

/**
 * Get role level based on priority
 */
export const getRoleLevel = (priority: number): RoleLevel => {
  if (priority >= 900) return "System";
  if (priority >= 800) return "Administrative";
  if (priority >= 600) return "Managerial";
  if (priority >= 400) return "Operational";
  if (priority >= 200) return "Staff";
  return "Basic";
};

/**
 * Get badge color for role level
 */
export const getRoleLevelColor = (roleLevel: RoleLevel | string): string => {
  const colors: Record<string, string> = {
    System: "bg-red-100 text-red-800",
    Administrative: "bg-purple-100 text-purple-800",
    Managerial: "bg-blue-100 text-blue-800",
    Operational: "bg-green-100 text-green-800",
    Staff: "bg-orange-100 text-orange-800",
    Basic: "bg-gray-100 text-gray-800",
  };
  return colors[roleLevel] || "bg-gray-100 text-gray-800";
};

/**
 * Get badge color for active status
 */
export const getStatusBadgeColor = (isActive: boolean): string => {
  return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
};

/**
 * Get badge color for system role
 */
export const getSystemBadgeColor = (isSystem: boolean): string => {
  return isSystem
    ? "bg-purple-100 text-purple-800"
    : "bg-blue-100 text-blue-800";
};

/**
 * Format role code for display
 */
export const formatRoleCode = (roleCode: string): string => {
  return roleCode
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

/**
 * Format date only (without time)
 */
export const formatDateOnly = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
};

/**
 * Group roles by level
 */
export const groupRolesByLevel = (
  roles: UserRoleType[],
): Record<RoleLevel, UserRoleType[]> => {
  const levels: RoleLevel[] = [
    "System",
    "Administrative",
    "Managerial",
    "Operational",
    "Staff",
    "Basic",
  ];

  const grouped: Record<RoleLevel, UserRoleType[]> = {} as Record<
    RoleLevel,
    UserRoleType[]
  >;

  levels.forEach((level) => {
    grouped[level] = [];
  });

  roles.forEach((role) => {
    const level = getRoleLevel(role.priority);
    grouped[level].push(role);
  });

  return grouped;
};

/**
 * Filter roles by active status
 */
export const filterRolesByStatus = (
  roles: UserRoleType[],
  isActive: boolean,
): UserRoleType[] => {
  return roles.filter((role) => role.isActive === isActive);
};

/**
 * Filter roles by system status
 */
export const filterRolesBySystem = (
  roles: UserRoleType[],
  isSystem: boolean,
): UserRoleType[] => {
  return roles.filter((role) => role.isSystem === isSystem);
};

/**
 * Sort roles by priority (descending)
 */
export const sortRolesByPriority = (
  roles: UserRoleType[],
  order: "asc" | "desc" = "desc",
): UserRoleType[] => {
  const sorted = [...roles];
  sorted.sort((a, b) => {
    if (order === "asc") {
      return a.priority - b.priority;
    }
    return b.priority - a.priority;
  });
  return sorted;
};

/**
 * Sort roles by name
 */
export const sortRolesByName = (
  roles: UserRoleType[],
  order: "asc" | "desc" = "asc",
): UserRoleType[] => {
  const sorted = [...roles];
  sorted.sort((a, b) => {
    if (order === "asc") {
      return a.roleName.localeCompare(b.roleName);
    }
    return b.roleName.localeCompare(a.roleName);
  });
  return sorted;
};

/**
 * Search roles by term
 */
export const searchRoles = (
  roles: UserRoleType[],
  searchTerm: string,
): UserRoleType[] => {
  const term = searchTerm.toLowerCase();
  return roles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(term) ||
      role.roleCode.toLowerCase().includes(term) ||
      role.roleDescription?.toLowerCase().includes(term),
  );
};

/**
 * Get role statistics summary
 */
export const calculateRoleStats = (
  roles: UserRoleType[],
): {
  totalRoles: number;
  activeRoles: number;
  inactiveRoles: number;
  systemRoles: number;
  customRoles: number;
  averagePriority: number;
  maxPriority: number;
  minPriority: number;
} => {
  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.isActive).length;
  const inactiveRoles = totalRoles - activeRoles;
  const systemRoles = roles.filter((r) => r.isSystem).length;
  const customRoles = totalRoles - systemRoles;
  const priorities = roles.map((r) => r.priority);
  const averagePriority =
    roles.length > 0
      ? Math.round(priorities.reduce((a, b) => a + b, 0) / roles.length)
      : 0;
  const maxPriority = Math.max(...priorities, 0);
  const minPriority = Math.min(...priorities, 0);

  return {
    totalRoles,
    activeRoles,
    inactiveRoles,
    systemRoles,
    customRoles,
    averagePriority,
    maxPriority,
    minPriority,
  };
};

/**
 * Get high priority roles (admin level)
 */
export const getHighPriorityRoles = (roles: UserRoleType[]): UserRoleType[] => {
  return roles.filter((role) => role.priority >= 800);
};

/**
 * Get low priority roles (basic users)
 */
export const getLowPriorityRoles = (roles: UserRoleType[]): UserRoleType[] => {
  return roles.filter((role) => role.priority < 200);
};

/**
 * Check if role can be edited
 */
export const canEditRole = (role: UserRoleType, userRole: string): boolean => {
  // Cannot edit system roles unless super admin
  if (role.isSystem && userRole !== "SUPER_ADMIN") {
    return false;
  }
  return true;
};

/**
 * Check if role can be deleted
 */
export const canDeleteRole = (
  role: UserRoleType,
  userRole: string,
  userCount: number,
): boolean => {
  // Cannot delete system roles
  if (role.isSystem) {
    return false;
  }
  // Cannot delete if users are assigned
  if (userCount > 0) {
    return false;
  }
  // Admin level check
  if (userRole !== "SUPER_ADMIN" && role.priority >= 800) {
    return false;
  }
  return true;
};

/**
 * Create role badge text
 */
export const getRoleBadgeText = (role: UserRoleType): string => {
  const badges = [];

  if (role.isSystem) {
    badges.push("System");
  }

  if (!role.isActive) {
    badges.push("Inactive");
  }

  const level = getRoleLevel(role.priority);
  badges.push(level);

  return badges.join(" • ");
};

/**
 * Validate role code format
 */
export const isValidRoleCode = (code: string): boolean => {
  return /^[A-Z0-9_]+$/.test(code);
};

/**
 * Validate priority range
 */
export const isValidPriority = (priority: number): boolean => {
  return priority >= 0 && priority <= 1000;
};
