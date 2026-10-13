// src/lib/types/userrole.ts
import { User } from "@/lib/types/auth";

export interface UserRole {
  _id: string;
  roleName: string;
  roleCode: string;
  roleDescription?: string;
  isActive: boolean;
  isSystem: boolean;
  priority: number;
  userCount?: number;
  permissionCount?: number;
  roleBadgeColor?: string;
  roleLevel?: string;
  createdBy: string | User;
  updatedBy?: string | User;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRoleDto {
  roleName: string;
  roleCode: string;
  roleDescription?: string;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateUserRoleDto {
  roleName?: string;
  roleCode?: string;
  roleDescription?: string;
  isActive?: boolean;
  priority?: number;
}

export interface UserRoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserRoleStats {
  totalRoles: number;
  activeRoles: number;
  inactiveRoles: number;
  systemRoles: number;
  averagePriority: number;
  maxPriority: number;
  minPriority: number;
  rolesWithUsers: number;
  rolesWithoutUsers: number;
  totalUsers: number;
  maxUsersPerRole: number;
  distributionByLevel: Record<string, number>;
  /** Present when API returns extended statistics (roles dashboard) */
  totalUsersWithRoles?: number;
  byRoleLevel?: Record<string, number>;
  topRolesByUserCount?: { roleName: string; userCount: number }[];
}

export interface PaginatedUserRoles {
  items: UserRole[];
  summary: {
    totalRoles: number;
    activeRoles: number;
    systemRoles: number;
    byRoleLevel: Record<string, number>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RoleHierarchy {
  level: string;
  description: string;
  roles: UserRole[];
  minPriority: number;
  maxPriority: number;
}

export interface RoleWithCount {
  roleId: string;
  roleName: string;
  roleCode: string;
  userCount: number;
  permissionCount: number;
}

export interface BulkUpdateRolesDto {
  roleIds: string[];
  isActive: boolean;
}

export interface BulkUpdateResult {
  matched: number;
  modified: number;
}

export interface InitializeDefaultsResult {
  created: number;
  updated: number;
  errors: string[];
}

export enum RoleLevel {
  SYSTEM = "System",
  ADMINISTRATIVE = "Administrative",
  MANAGERIAL = "Managerial",
  OPERATIONAL = "Operational",
  STAFF = "Staff",
  BASIC = "Basic",
}

/** List response shape for GET /userrole (API layer) */
export type GetUserRolesResult = PaginatedUserRoles;

/** Statistics payload (alias; same fields as UserRoleStats) */
export type UserRoleStatistics = UserRoleStats;

/** Legacy name used by API client and hooks */
export type UserRoleType = UserRole;
