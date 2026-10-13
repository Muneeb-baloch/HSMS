import { AxiosResponse } from "axios";
import {
  ApiResponse,
  BulkPermissionUpdateDto,
  BulkUpdateResult,
  CopyPermissionsDto,
  CopyPermissionsResult,
  CreateUserPermissionDto,
  GetUserPermissionsResult,
  InitializeDefaultPermissionsResult,
  ModulePermissionsSummary,
  PermissionCheckDto,
  PermissionCheckResponse,
  RolePermissionsMapResponse,
  RolePermissionsSummary,
  SetPermissionsDto,
  UpdateUserPermissionDto,
  UserPermission,
  UserPermissionQueryParams,
  UserPermissionStatistics,
} from "../types/permissions";
import { apiClient } from "./client";

export const permissionApi = {
  /**
   * Create a new user permission
   */
  createPermission: (
    data: CreateUserPermissionDto,
  ): Promise<AxiosResponse<ApiResponse<UserPermission>>> =>
    apiClient.post<UserPermission>("/permission", data),

  /**
   * Get all user permissions with filters and pagination
   */
  getPermissions: (
    params?: UserPermissionQueryParams,
  ): Promise<AxiosResponse<ApiResponse<GetUserPermissionsResult>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.srModuleId)
        queryParams.append("srModuleId", params.srModuleId);
      if (params.roleId) queryParams.append("roleId", params.roleId);
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params.hasAccess !== undefined)
        queryParams.append("hasAccess", params.hasAccess.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    }
    const queryString = queryParams.toString();
    return apiClient.get<GetUserPermissionsResult>(
      `/permission?${queryString}`,
    );
  },

  /**
   * Get a specific permission by ID
   */
  getPermissionById: (
    id: string,
  ): Promise<AxiosResponse<ApiResponse<UserPermission>>> =>
    apiClient.get<UserPermission>(`/permission/${id}`),

  /**
   * Update a user permission
   */
  updatePermission: (
    id: string,
    data: UpdateUserPermissionDto,
  ): Promise<AxiosResponse<ApiResponse<UserPermission>>> =>
    apiClient.put<UserPermission>(`/permission/${id}`, data),

  /**
   * Delete a user permission (soft delete)
   */
  deletePermission: (
    id: string,
  ): Promise<
    AxiosResponse<ApiResponse<{ success: boolean; message: string }>>
  > =>
    apiClient.delete<{ success: boolean; message: string }>(
      `/permission/${id}`,
    ),

  /**
   * Set permissions for a role and module
   */
  setPermissions: (
    data: SetPermissionsDto,
  ): Promise<AxiosResponse<ApiResponse<UserPermission>>> =>
    apiClient.post<UserPermission>("/permission/set", data),

  /**
   * Get permissions by role
   */
  getPermissionsByRole: (
    roleId: string,
  ): Promise<AxiosResponse<ApiResponse<UserPermission[]>>> =>
    apiClient.get<UserPermission[]>(`/permission/role/${roleId}`),

  /**
   * Get permissions by module
   */
  getPermissionsByModule: (
    moduleId: string,
  ): Promise<AxiosResponse<ApiResponse<UserPermission[]>>> =>
    apiClient.get<UserPermission[]>(`/permission/module/${moduleId}`),

  /**
   * Check if role has specific permission
   */
  checkPermission: (
    data: PermissionCheckDto,
  ): Promise<AxiosResponse<ApiResponse<PermissionCheckResponse>>> =>
    apiClient.post<PermissionCheckResponse>("/permission/check", data),

  /**
   * Bulk update permissions
   */
  bulkUpdatePermissions: (
    data: BulkPermissionUpdateDto,
  ): Promise<AxiosResponse<ApiResponse<BulkUpdateResult>>> =>
    apiClient.post<BulkUpdateResult>("/permission/bulk-update", data),

  /**
   * Copy permissions from one role to another
   */
  copyPermissions: (
    data: CopyPermissionsDto,
  ): Promise<AxiosResponse<ApiResponse<CopyPermissionsResult>>> =>
    apiClient.post<CopyPermissionsResult>("/permission/copy", data),

  /**
   * Get role permissions summary
   */
  getRolePermissionsSummary: (
    roleId: string,
  ): Promise<AxiosResponse<ApiResponse<RolePermissionsSummary>>> =>
    apiClient.get<RolePermissionsSummary>(`/permission/role/${roleId}/summary`),

  /**
   * Get module permissions summary
   */
  getModulePermissionsSummary: (
    moduleId: string,
  ): Promise<AxiosResponse<ApiResponse<ModulePermissionsSummary>>> =>
    apiClient.get<ModulePermissionsSummary>(
      `/permission/module/${moduleId}/summary`,
    ),

  /**
   * Get user permission statistics
   */
  getStatistics: (): Promise<
    AxiosResponse<ApiResponse<UserPermissionStatistics>>
  > => apiClient.get<UserPermissionStatistics>("/permission/statistics"),

  /**
   * Get permission by role and module
   */
  getPermissionByRoleAndModule: (
    roleId: string,
    moduleId: string,
  ): Promise<AxiosResponse<ApiResponse<UserPermission>>> => {
    const params = new URLSearchParams({
      roleId,
      srModuleId: moduleId,
    });
    return apiClient.get<UserPermission>(
      `/permission/by-role-module?${params.toString()}`,
    );
  },

  /**
   * Toggle permission active status
   */
  togglePermissionStatus: (
    id: string,
  ): Promise<AxiosResponse<ApiResponse<UserPermission>>> =>
    apiClient.patch<UserPermission>(`/permission/${id}/toggle-status`, {}),

  /**
   * Initialize default permissions
   */
  initializeDefaultPermissions: (): Promise<
    AxiosResponse<ApiResponse<InitializeDefaultPermissionsResult>>
  > =>
    apiClient.post<InitializeDefaultPermissionsResult>(
      "/permission/initialize-defaults",
      {},
    ),

  /**
   * Get role permissions map (optimized for authorization)
   */
  getRolePermissionsMap: (
    roleId: string,
  ): Promise<AxiosResponse<ApiResponse<RolePermissionsMapResponse>>> =>
    apiClient.get<RolePermissionsMapResponse>(`/permission/role/${roleId}/map`),
};

export default permissionApi;
