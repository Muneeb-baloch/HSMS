// src/lib/types/userpermission.ts
import { User } from "@/lib/types/auth";

export enum PermissionType {
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  EXPORT = "export",
  IMPORT = "import",
  APPROVE = "approve",
  VERIFY = "verify",
}

export enum AccessType {
  NO_ACCESS = "No Access",
  VIEW_ONLY = "View Only",
  LIMITED_ACCESS = "Limited Access",
  FULL_ACCESS = "Full Access",
}

export interface UserPermission {
  _id: string;
  srModuleId:
    | string
    | {
        _id: string;
        moduleName: string;
        moduleCode: string;
        iconName?: string;
        routePath?: string;
      };
  roleId:
    | string
    | { _id: string; roleName: string; roleCode: string; description?: string };
  moduleName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canApprove?: boolean;
  canVerify?: boolean;
  isActive: boolean;
  permissionLevel?: string;
  accessType?: AccessType;
  accessBadgeColor?: string;
  permissionScore?: number;
  createdBy: string | User;
  updatedBy?: string | User;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPermissionDto {
  srModuleId: string;
  roleId: string;
  moduleName?: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canApprove?: boolean;
  canVerify?: boolean;
  isActive?: boolean;
}

export interface UpdateUserPermissionDto {
  canRead?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canApprove?: boolean;
  canVerify?: boolean;
  isActive?: boolean;
}

export interface BulkPermissionUpdateDto {
  permissionIds: string[];
  canRead?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canApprove?: boolean;
  canVerify?: boolean;
  isActive?: boolean;
}

export interface SetPermissionsDto {
  srModuleId: string;
  roleId: string;
  permissions: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canExport?: boolean;
    canImport?: boolean;
    canApprove?: boolean;
    canVerify?: boolean;
  };
}

export interface CopyPermissionsDto {
  sourceRoleId: string;
  targetRoleId: string;
  overrideExisting?: boolean;
}

export interface PermissionCheckDto {
  roleId: string;
  srModuleId: string;
  permissionType: PermissionType;
}

export interface UserPermissionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  srModuleId?: string;
  roleId?: string;
  isActive?: boolean;
  hasAccess?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RolePermissionsSummary {
  roleId: string;
  roleName: string;
  totalModules: number;
  accessibleModules: number;
  fullAccessModules: number;
  readOnlyModules: number;
  noAccessModules: number;
  permissionsByModule: Array<{
    moduleId: string;
    moduleName: string;
    moduleCode: string;
    accessType: string;
    permissions: string[];
  }>;
}

export interface ModulePermissionsSummary {
  moduleId: string;
  moduleName: string;
  moduleCode: string;
  totalRoles: number;
  accessibleRoles: number;
  rolesWithAccess: Array<{
    roleId: string;
    roleName: string;
    accessType: string;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }>;
}

export interface UserPermissionStats {
  totalPermissions: number;
  activePermissions: number;
  inactivePermissions: number;
  modulesWithPermissions: number;
  rolesWithPermissions: number;
  byAccessType: Record<string, number>;
  byModule: Record<string, number>;
  byRole: Record<string, number>;
  permissionDistribution: {
    read: number;
    create: number;
    update: number;
    delete: number;
    export: number;
    import: number;
    approve: number;
    verify: number;
  };
}

export interface PaginatedUserPermissions {
  items: UserPermission[];
  summary: {
    totalPermissions: number;
    activePermissions: number;
    byAccessType: Record<string, number>;
    byModule: Record<string, number>;
    byRole: Record<string, number>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CopyPermissionsResult {
  copied: number;
  skipped: number;
  errors: string[];
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

export interface RolePermissionsMap {
  [moduleCode: string]: {
    moduleId: string;
    moduleName: string;
    moduleCode: string;
    routePath?: string;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canExport?: boolean;
    canImport?: boolean;
    canApprove?: boolean;
    canVerify?: boolean;
  };
}

/** Paginated permissions result from GET /permission */
export type GetUserPermissionsResult = PaginatedUserPermissions;

/** Response from POST /permission/check */
export interface PermissionCheckResponse {
  hasPermission: boolean;
  permission?: UserPermission;
}

/** Response from GET /permission/role/:id/map */
export interface RolePermissionsMapResponse {
  roleId: string;
  roleName: string;
  permissionsMap: RolePermissionsMap;
}

/** Response from POST /permission/initialize-defaults */
export interface InitializeDefaultPermissionsResult {
  created: number;
  updated: number;
  errors: string[];
}

/** Statistics from GET /permission/statistics */
export type UserPermissionStatistics = UserPermissionStats;
