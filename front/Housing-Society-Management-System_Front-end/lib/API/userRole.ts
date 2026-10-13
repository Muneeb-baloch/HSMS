import { AxiosResponse } from "axios";
import {
  ApiResponse,
  BulkUpdateResult,
  BulkUpdateRolesDto,
  CreateUserRoleDto,
  GetUserRolesResult,
  RoleHierarchy,
  UpdateUserRoleDto,
  UserRoleQueryParams,
  UserRoleStatistics,
  UserRoleType,
} from "../types/userrole";
import { apiClient } from "./client";

export const userRoleApi = {
  /**
   * Create a new user role
   */
  createRole: (
    data: CreateUserRoleDto,
  ): Promise<AxiosResponse<ApiResponse<UserRoleType>>> =>
    apiClient.post<UserRoleType>("/userrole", data),

  /**
   * Get all user roles with pagination and filters
   */
  getRoles: (
    params?: UserRoleQueryParams,
  ): Promise<AxiosResponse<ApiResponse<GetUserRolesResult>>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params.isSystem !== undefined)
        queryParams.append("isSystem", params.isSystem.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    }
    return apiClient.get<GetUserRolesResult>(
      `/userrole?${queryParams.toString()}`,
    );
  },

  /**
   * Get user role by ID
   */
  getRoleById: (
    id: string,
  ): Promise<AxiosResponse<ApiResponse<UserRoleType>>> =>
    apiClient.get<UserRoleType>(`/userrole/${id}`),

  /**
   * Get role by code
   */
  getRoleByCode: (
    roleCode: string,
  ): Promise<AxiosResponse<ApiResponse<UserRoleType>>> =>
    apiClient.get<UserRoleType>(`/userrole/code/${roleCode}`),

  /**
   * Update user role
   */
  updateRole: (
    id: string,
    data: UpdateUserRoleDto,
  ): Promise<AxiosResponse<ApiResponse<UserRoleType>>> =>
    apiClient.put<UserRoleType>(`/userrole/${id}`, data),

  /**
   * Delete user role (soft delete)
   */
  deleteRole: (
    id: string,
  ): Promise<
    AxiosResponse<ApiResponse<{ success: boolean; message: string }>>
  > =>
    apiClient.delete<{ success: boolean; message: string }>(`/userrole/${id}`),

  /**
   * Toggle role status
   */
  toggleRoleStatus: (
    id: string,
  ): Promise<AxiosResponse<ApiResponse<UserRoleType>>> =>
    apiClient.patch<UserRoleType>(`/userrole/${id}/toggle-status`, {}),

  /**
   * Get active roles only
   */
  getActiveRoles: (): Promise<AxiosResponse<ApiResponse<UserRoleType[]>>> =>
    apiClient.get<UserRoleType[]>("/userrole/active"),

  /**
   * Get roles with user count
   */
  getRolesWithUserCount: (): Promise<AxiosResponse<ApiResponse<any[]>>> =>
    apiClient.get<any[]>("/userrole/with-user-count"),

  /**
   * Search roles
   */
  searchRoles: (
    searchTerm: string,
    limit?: number,
  ): Promise<AxiosResponse<ApiResponse<UserRoleType[]>>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("search", searchTerm);
    if (limit) queryParams.append("limit", limit.toString());
    return apiClient.get<UserRoleType[]>(
      `/userrole/search?${queryParams.toString()}`,
    );
  },

  /**
   * Get role hierarchy
   */
  getRoleHierarchy: (): Promise<AxiosResponse<ApiResponse<RoleHierarchy[]>>> =>
    apiClient.get<RoleHierarchy[]>("/userrole/hierarchy"),

  /**
   * Get role statistics
   */
  getRoleStatistics: (): Promise<
    AxiosResponse<ApiResponse<UserRoleStatistics>>
  > => apiClient.get<UserRoleStatistics>("/userrole/statistics"),

  /**
   * Bulk update roles
   */
  bulkUpdateRoles: (
    data: BulkUpdateRolesDto,
  ): Promise<AxiosResponse<ApiResponse<BulkUpdateResult>>> =>
    apiClient.post<BulkUpdateResult>("/userrole/bulk-update", data),

  /**
   * Initialize default roles
   */
  initializeDefaultRoles: (): Promise<
    AxiosResponse<
      ApiResponse<{
        created: number;
        updated: number;
        errors: string[];
      }>
    >
  > => apiClient.post("/userrole/initialize-defaults", {}),
};
