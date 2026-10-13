import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  BillInfo,
  BillInfoQueryParams,
  BillDashboardSummary,
  BillStatistics,
  CreateBillInfoDto,
  UpdateBillInfoDto,
  RecordPaymentDto,
  GenerateBillsDto,
} from "@/lib/types/billInfo";

const BASE = "/billinfo";

export const billInfoApi = {
  getBills: (params: BillInfoQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.memId) queryParams.memId = params.memId;
    if (params.fileId) queryParams.fileId = params.fileId;
    if (params.billTypeId) queryParams.billTypeId = params.billTypeId;
    if (params.status) queryParams.status = params.status;
    if (params.billMonth) queryParams.billMonth = params.billMonth;
    if (params.year) queryParams.year = params.year;
    if (params.isOverdue !== undefined) queryParams.isOverdue = params.isOverdue;
    if (params.minAmount !== undefined) queryParams.minAmount = params.minAmount;
    if (params.maxAmount !== undefined) queryParams.maxAmount = params.maxAmount;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    return apiClient.get<{
      bills: BillInfo[];
      pagination: PaginatedResponse<BillInfo>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getBill: (id: string) => apiClient.get<BillInfo>(`${BASE}/${id}`),

  getBillByNumber: (billNo: string) =>
    apiClient.get<BillInfo>(`${BASE}/bill-no/${encodeURIComponent(billNo)}`),

  getBillsByMember: (memId: string, activeOnly = true) =>
    apiClient.get<BillInfo[]>(`${BASE}/member/${memId}`, {
      params: { activeOnly },
    }),

  getMemberBillsSummary: (memId: string) =>
    apiClient.get<unknown>(`${BASE}/member/${memId}/summary`),

  getBillsByFile: (fileId: string, activeOnly = true) =>
    apiClient.get<BillInfo[]>(`${BASE}/file/${fileId}`, {
      params: { activeOnly },
    }),

  getStatistics: (year?: number) =>
    apiClient.get<BillStatistics>(`${BASE}/statistics`, {
      params: year ? { year } : {},
    }),

  getDashboardSummary: () =>
    apiClient.get<BillDashboardSummary>(`${BASE}/dashboard-summary`),

  getOverdue: (page = 1, limit = 20) =>
    apiClient.get<{ bills: BillInfo[]; total: number; pages: number }>(
      `${BASE}/overdue`,
      { params: { page, limit } }
    ),

  create: (data: CreateBillInfoDto) => apiClient.post<BillInfo>(BASE, data),

  update: (id: string, data: UpdateBillInfoDto) =>
    apiClient.put<BillInfo>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  recordPayment: (id: string, data: RecordPaymentDto) =>
    apiClient.post<BillInfo>(`${BASE}/${id}/record-payment`, data),

  generate: (data: GenerateBillsDto) =>
    apiClient.post<{ success: number; failed: number }>(`${BASE}/generate`, data),

  applyFineOverdue: () =>
    apiClient.post<{ updated: number }>(`${BASE}/apply-fine-overdue`, {}),
};
