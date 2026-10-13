// src/lib/API/complaintCategoryApi.ts
import { AxiosResponse } from "axios";
import { ApiResponse } from "../types/api";
import {
  BulkUpdateResult,
  CategoryDropdownItem,
  CategoryStatistics,
  CreateSrComplaintCategoryDto,
  GetSrComplaintCategoriesResult,
  ImportCategoriesResult,
  SrComplaintCategoryType,
  UpdateSrComplaintCategoryDto,
} from "../types/srComplaintCategory";
import { apiClient } from "./client";

export const complaintCategoryApi = {
  /**
   * Create a new complaint category
   */
  createCategory: (
    data: CreateSrComplaintCategoryDto,
  ): Promise<AxiosResponse<ApiResponse<SrComplaintCategoryType>>> =>
    apiClient.post<SrComplaintCategoryType>("/complaincatg", data),

  /**
   * Get all complaint categories with pagination and filters
   */
  getCategories: (
    params?: any,
  ): Promise<AxiosResponse<ApiResponse<GetSrComplaintCategoriesResult>>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.minPriority !== undefined)
        queryParams.append("minPriority", params.minPriority.toString());
      if (params.maxPriority !== undefined)
        queryParams.append("maxPriority", params.maxPriority.toString());
      if (params.maxSlaHours !== undefined)
        queryParams.append("maxSlaHours", params.maxSlaHours.toString());
    }

    return apiClient.get<GetSrComplaintCategoriesResult>(
      `/complaincatg?${queryParams.toString()}`,
    );
  },

  /**
   * Get complaint category by ID
   */
  getCategoryById: (
    id: string,
  ): Promise<AxiosResponse<ApiResponse<SrComplaintCategoryType>>> =>
    apiClient.get<SrComplaintCategoryType>(`/complaincatg/${id}`),

  /**
   * Get category by code
   */
  getCategoryByCode: (
    code: string,
  ): Promise<AxiosResponse<ApiResponse<SrComplaintCategoryType>>> =>
    apiClient.get<SrComplaintCategoryType>(`/complaincatg/code/${code}`),

  /**
   * Update complaint category
   */
  updateCategory: (
    id: string,
    data: UpdateSrComplaintCategoryDto,
  ): Promise<AxiosResponse<ApiResponse<SrComplaintCategoryType>>> =>
    apiClient.put<SrComplaintCategoryType>(`/complaincatg/${id}`, data),

  /**
   * Delete complaint category (soft delete)
   */
  deleteCategory: (
    id: string,
  ): Promise<
    AxiosResponse<ApiResponse<{ success: boolean; message: string }>>
  > =>
    apiClient.delete<{ success: boolean; message: string }>(
      `/complaincatg/${id}`,
    ),

  /**
   * Toggle category status
   */
  toggleCategoryStatus: (
    id: string,
  ): Promise<AxiosResponse<ApiResponse<SrComplaintCategoryType>>> =>
    apiClient.patch<SrComplaintCategoryType>(
      `/complaincatg/${id}/toggle-status`,
      {},
    ),

  /**
   * Get active categories only
   */
  getActiveCategories: (): Promise<
    AxiosResponse<ApiResponse<SrComplaintCategoryType[]>>
  > => apiClient.get<SrComplaintCategoryType[]>("/complaincatg/active"),

  /**
   * Get high priority categories (priority 1-3)
   */
  getHighPriorityCategories: (): Promise<
    AxiosResponse<ApiResponse<SrComplaintCategoryType[]>>
  > => apiClient.get<SrComplaintCategoryType[]>("/complaincatg/high-priority"),

  /**
   * Get urgent SLA categories (SLA < 24 hours)
   */
  getUrgentSlaCategories: (): Promise<
    AxiosResponse<ApiResponse<SrComplaintCategoryType[]>>
  > => apiClient.get<SrComplaintCategoryType[]>("/complaincatg/urgent-sla"),

  /**
   * Search categories with advanced filters
   */
  searchCategories: (
    searchTerm: string,
    filters?: {
      isActive?: boolean;
      minPriority?: number;
      maxPriority?: number;
      minSlaHours?: number;
      maxSlaHours?: number;
    },
  ): Promise<AxiosResponse<ApiResponse<SrComplaintCategoryType[]>>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("searchTerm", searchTerm);

    if (filters) {
      if (filters.isActive !== undefined)
        queryParams.append("isActive", filters.isActive.toString());
      if (filters.minPriority !== undefined)
        queryParams.append("minPriority", filters.minPriority.toString());
      if (filters.maxPriority !== undefined)
        queryParams.append("maxPriority", filters.maxPriority.toString());
      if (filters.minSlaHours !== undefined)
        queryParams.append("minSlaHours", filters.minSlaHours.toString());
      if (filters.maxSlaHours !== undefined)
        queryParams.append("maxSlaHours", filters.maxSlaHours.toString());
    }

    return apiClient.get<SrComplaintCategoryType[]>(
      `/complaincatg/search?${queryParams.toString()}`,
    );
  },

  /**
   * Get categories by priority range
   */
  getCategoriesByPriority: (
    min: number,
    max: number,
  ): Promise<AxiosResponse<ApiResponse<SrComplaintCategoryType[]>>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("min", min.toString());
    queryParams.append("max", max.toString());

    return apiClient.get<SrComplaintCategoryType[]>(
      `/complaincatg/by-priority?${queryParams.toString()}`,
    );
  },

  /**
   * Get category statistics
   */
  getCategoryStatistics: (): Promise<
    AxiosResponse<ApiResponse<CategoryStatistics>>
  > => apiClient.get<CategoryStatistics>("/complaincatg/statistics"),

  /**
   * Get categories for dropdown (simplified format)
   */
  getCategoriesForDropdown: (): Promise<
    AxiosResponse<ApiResponse<CategoryDropdownItem[]>>
  > => apiClient.get<CategoryDropdownItem[]>("/complaincatg/dropdown"),

  /**
   * Bulk update category statuses
   */
  bulkUpdateCategoryStatus: (
    categoryIds: string[],
    isActive: boolean,
  ): Promise<AxiosResponse<ApiResponse<BulkUpdateResult>>> =>
    apiClient.post<BulkUpdateResult>("/complaincatg/bulk-status", {
      categoryIds,
      isActive,
    }),

  /**
   * Import multiple categories
   */
  importCategories: (
    categories: CreateSrComplaintCategoryDto[],
  ): Promise<AxiosResponse<ApiResponse<ImportCategoriesResult>>> =>
    apiClient.post<ImportCategoriesResult>("/complaincatg/import", categories),

  /**
   * Validate category data
   */
  validateCategory: (
    data: CreateSrComplaintCategoryDto,
  ): Promise<
    AxiosResponse<ApiResponse<{ valid: boolean; errors: string[] }>>
  > =>
    apiClient.post<{ valid: boolean; errors: string[] }>(
      "/complaincatg/validate",
      data,
    ),

  /**
   * Check if category code exists
   */
  checkCategoryCodeExists: (
    code: string,
    excludeId?: string,
  ): Promise<AxiosResponse<ApiResponse<{ exists: boolean }>>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("code", code);
    if (excludeId) queryParams.append("excludeId", excludeId);

    return apiClient.get<{ exists: boolean }>(
      `/complaincatg/check-code?${queryParams.toString()}`,
    );
  },

  /**
   * Get recently created categories
   */
  getRecentlyCreatedCategories: (
    limit: number = 10,
  ): Promise<AxiosResponse<ApiResponse<SrComplaintCategoryType[]>>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());

    return apiClient.get<SrComplaintCategoryType[]>(
      `/complaincatg/recent?${queryParams.toString()}`,
    );
  },

  /**
   * Get categories with upcoming SLA deadlines
   */
  getCategoriesWithUpcomingSlaDeadlines: (): Promise<
    AxiosResponse<
      ApiResponse<
        Array<{
          category: SrComplaintCategoryType;
          urgency: "Critical" | "High" | "Medium" | "Low";
          hoursLeft: number;
        }>
      >
    >
  > => apiClient.get("/complaincatg/upcoming-sla"),

  /**
   * Get priority distribution
   */
  getPriorityDistribution: (): Promise<
    AxiosResponse<
      ApiResponse<
        Array<{
          priority: number;
          label: string;
          count: number;
          active: number;
        }>
      >
    >
  > => apiClient.get("/complaincatg/priority-distribution"),

  /**
   * Export categories to CSV
   */
  exportCategories: (params?: any): Promise<AxiosResponse<any>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.search) queryParams.append("search", params.search);
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params.minPriority !== undefined)
        queryParams.append("minPriority", params.minPriority.toString());
      if (params.maxPriority !== undefined)
        queryParams.append("maxPriority", params.maxPriority.toString());
    }

    return apiClient.get(`/complaincatg/export?${queryParams.toString()}`, {
      responseType: "blob",
    });
  },

  /**
   * Restore deleted category
   */
  restoreCategory: (
    id: string,
  ): Promise<AxiosResponse<ApiResponse<SrComplaintCategoryType>>> =>
    apiClient.patch<SrComplaintCategoryType>(`/complaincatg/${id}/restore`, {}),

  /**
   * Get categories count by status
   */
  getCategoriesCountByStatus: (): Promise<
    AxiosResponse<
      ApiResponse<{
        active: number;
        inactive: number;
        total: number;
        deleted: number;
      }>
    >
  > => apiClient.get("/complaincatg/count-by-status"),
};
