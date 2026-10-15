import { apiClient } from "@/lib/API/client";
import { ApiResponse, PaginatedResponse } from "@/lib/types/api";
import {
  DefaulterRow,
  DefaulterQueryParams,
  DefaulterStatistics,
  SendNoticeDto,
  SetRemarksDto,
  SetStatusOverrideDto,
} from "@/lib/types/defaulter";

const BASE = "/defaulter";

export const defaulterApi = {
  getStatistics: () =>
    apiClient.get<ApiResponse<DefaulterStatistics>>(`${BASE}/statistics`),

  getDefaulters: (params: DefaulterQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search) queryParams.search = params.search;
    if (params.status) queryParams.status = params.status;
    if (params.minAmount !== undefined) queryParams.minAmount = params.minAmount;
    if (params.maxAmount !== undefined) queryParams.maxAmount = params.maxAmount;
    if (params.minDays !== undefined) queryParams.minDays = params.minDays;
    if (params.maxDays !== undefined) queryParams.maxDays = params.maxDays;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    return apiClient.get<
      ApiResponse<{
        defaulters: DefaulterRow[];
        pagination: PaginatedResponse<DefaulterRow>["pagination"];
      }>
    >(BASE, { params: queryParams });
  },

  getDefaulter: (fileId: string) =>
    apiClient.get<ApiResponse<DefaulterRow>>(`${BASE}/${fileId}`),

  setStatusOverride: (fileId: string, data: SetStatusOverrideDto) =>
    apiClient.patch<ApiResponse<DefaulterRow>>(`${BASE}/${fileId}/status`, data),

  setRemarks: (fileId: string, data: SetRemarksDto) =>
    apiClient.patch<ApiResponse<DefaulterRow>>(`${BASE}/${fileId}/remarks`, data),

  sendNotice: (fileId: string, data: SendNoticeDto) =>
    apiClient.post<ApiResponse<DefaulterRow>>(`${BASE}/${fileId}/notice`, data),
};
