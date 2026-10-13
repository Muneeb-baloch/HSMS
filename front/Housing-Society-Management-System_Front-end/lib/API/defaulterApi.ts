import { apiClient } from "@/lib/API/client";
import { ApiResponse, PaginatedResponse } from "@/lib/types/api";
import {
  Defaulter,
  DefaulterQueryParams,
  CreateDefaulterDto,
  UpdateDefaulterDto,
  DefaulterStatistics,
  OverdueSummary,
  ActiveCountResponse,
  SendNoticeDto,
  ResolveDefaulterDto,
  BulkUpdateStatusDto,
} from "@/lib/types/defaulter";

const BASE = "/defaulter";

export const defaulterApi = {
  getStatistics: () =>
    apiClient.get<ApiResponse<DefaulterStatistics>>(`${BASE}/statistics`),

  getOverdueSummary: () =>
    apiClient.get<ApiResponse<OverdueSummary>>(`${BASE}/overdue-summary`),

  getActiveCount: () =>
    apiClient.get<ApiResponse<ActiveCountResponse>>(`${BASE}/active-count`),

  getDefaulters: (params: DefaulterQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search) queryParams.search = params.search;
    if (params.memId) queryParams.memId = params.memId;
    if (params.plotId) queryParams.plotId = params.plotId;
    if (params.fileId) queryParams.fileId = params.fileId;
    if (params.status) queryParams.status = params.status;
    if (params.minAmount !== undefined) queryParams.minAmount = params.minAmount;
    if (params.maxAmount !== undefined) queryParams.maxAmount = params.maxAmount;
    if (params.minDays !== undefined) queryParams.minDays = params.minDays;
    if (params.maxDays !== undefined) queryParams.maxDays = params.maxDays;
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    return apiClient.get<
      ApiResponse<{
        defaulters: Defaulter[];
        pagination: PaginatedResponse<Defaulter>["pagination"];
      }>
    >(BASE, { params: queryParams });
  },

  getDefaulter: (id: string) =>
    apiClient.get<Defaulter>(`${BASE}/${id}`),

  create: (data: CreateDefaulterDto) =>
    apiClient.post<ApiResponse<Defaulter>>(BASE, data),

  update: (id: string, data: UpdateDefaulterDto) =>
    apiClient.put<ApiResponse<Defaulter>>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  getByMember: (memId: string, activeOnly = true) =>
    apiClient.get<Defaulter[]>(`${BASE}/member/${memId}`, {
      params: { activeOnly },
    }),

  getByPlot: (plotId: string, activeOnly = true) =>
    apiClient.get<Defaulter[]>(`${BASE}/plot/${plotId}`, {
      params: { activeOnly },
    }),

  sendNotice: (id: string, data: SendNoticeDto) =>
    apiClient.post<ApiResponse<Defaulter>>(`${BASE}/${id}/send-notice`, data),

  resolve: (id: string, data: ResolveDefaulterDto) =>
    apiClient.post<ApiResponse<Defaulter>>(`${BASE}/${id}/resolve`, data),

  bulkUpdateStatus: (data: BulkUpdateStatusDto) =>
    apiClient.post<ApiResponse<{ matched: number; modified: number }>>(
      `${BASE}/bulk/update-status`,
      data
    ),
};
