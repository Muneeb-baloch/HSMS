// src/lib/API/paymentModeApi.ts
import { AxiosResponse } from "axios";
import { ApiResponse } from "../types/api";
import {
  CreatePaymentModeDto,
  GetPaymentModesResult,
  PaymentMode,
  PaymentModeSummary,
  UpdatePaymentModeDto,
} from "../types/paymentMode";
import { apiClient } from "./client";

export const paymentModeApi = {
  /**
   * Create a new payment mode
   */
  createPaymentMode: (
    data: CreatePaymentModeDto,
  ): Promise<AxiosResponse<ApiResponse<PaymentMode>>> =>
    apiClient.post<PaymentMode>("/paymentmodes", data),

  /**
   * Get all payment modes with pagination and filters
   */
  getPaymentModes: (
    params?: any,
  ): Promise<AxiosResponse<ApiResponse<GetPaymentModesResult>>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    }

    return apiClient.get<GetPaymentModesResult>(
      `/paymentmodes?${queryParams.toString()}`,
    );
  },

  /**
   * Get payment mode by ID
   */
  getPaymentModeById: (
    id: string,
  ): Promise<AxiosResponse<ApiResponse<PaymentMode>>> =>
    apiClient.get<PaymentMode>(`/paymentmodes/${id}`),

  /**
   * Update payment mode
   */
  updatePaymentMode: (
    id: string,
    data: UpdatePaymentModeDto,
  ): Promise<AxiosResponse<ApiResponse<PaymentMode>>> =>
    apiClient.put<PaymentMode>(`/paymentmodes/${id}`, data),

  /**
   * Delete payment mode (soft delete)
   */
  deletePaymentMode: (
    id: string,
  ): Promise<
    AxiosResponse<ApiResponse<{ success: boolean; message: string }>>
  > =>
    apiClient.delete<{ success: boolean; message: string }>(
      `/paymentmodes/${id}`,
    ),

  /**
   * Toggle payment mode status
   */
  togglePaymentModeStatus: (
    id: string,
  ): Promise<AxiosResponse<ApiResponse<PaymentMode>>> =>
    apiClient.patch<PaymentMode>(`/paymentmodes/${id}/toggle-status`, {}),

  /**
   * Get payment mode summary
   */
  getPaymentModeSummary: (): Promise<
    AxiosResponse<ApiResponse<PaymentModeSummary>>
  > => apiClient.get<PaymentModeSummary>("/paymentmodes/summary"),

  /**
   * Get payment modes for dropdown
   */
  getPaymentModesForDropdown: (): Promise<
    AxiosResponse<
      ApiResponse<Array<{ id: string; name: string; description?: string }>>
    >
  > => apiClient.get("/paymentmodes/dropdown"),

  /**
   * Get default payment modes
   */
  getDefaultPaymentModes: (): Promise<
    AxiosResponse<ApiResponse<PaymentMode[]>>
  > => apiClient.get<PaymentMode[]>("/paymentmodes/defaults"),

  /**
   * Check if payment mode name exists
   */
  checkPaymentModeNameExists: (
    name: string,
    excludeId?: string,
  ): Promise<AxiosResponse<ApiResponse<{ exists: boolean }>>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("name", name);
    if (excludeId) queryParams.append("excludeId", excludeId);

    return apiClient.get<{ exists: boolean }>(
      `/paymentmodes/check-name?${queryParams.toString()}`,
    );
  },

  /**
   * Get recently created payment modes
   */
  getRecentlyCreatedPaymentModes: (
    limit: number = 10,
  ): Promise<AxiosResponse<ApiResponse<PaymentMode[]>>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());

    return apiClient.get<PaymentMode[]>(
      `/paymentmodes/recent?${queryParams.toString()}`,
    );
  },

  /**
   * Get payment mode statistics
   */
  getPaymentModeStatistics: (): Promise<
    AxiosResponse<
      ApiResponse<{
        total: number;
        active: number;
        inactive: number;
        byType: Record<string, number>;
      }>
    >
  > => apiClient.get("/paymentmodes/statistics"),

  /**
   * Export payment modes to CSV
   */
  exportPaymentModes: (params?: any): Promise<AxiosResponse<Blob>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.search) queryParams.append("search", params.search);
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
    }

    return apiClient.get(`/paymentmodes/export?${queryParams.toString()}`, {
      responseType: "blob",
    }) as Promise<AxiosResponse<Blob>>;
  },
};
