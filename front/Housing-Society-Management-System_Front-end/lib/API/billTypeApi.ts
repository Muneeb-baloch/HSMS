import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  BillType,
  BillTypeQueryParams,
  BillTypeStatistics,
  CreateBillTypeDto,
  UpdateBillTypeDto,
  CalculateAmountResult,
  ValidateConfigurationResult,
} from "@/lib/types/billType";

const BASE = "/billtype";

export const billTypeApi = {
  getBillTypes: (params: BillTypeQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search) queryParams.search = params.search;
    if (params.category) queryParams.category = params.category;
    if (params.isRecurring !== undefined)
      queryParams.isRecurring = params.isRecurring;
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    return apiClient.get<{
      billTypes: BillType[];
      pagination: PaginatedResponse<BillType>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getBillType: (id: string) => apiClient.get<BillType>(`${BASE}/${id}`),

  getBillTypeByName: (name: string) =>
    apiClient.get<BillType>(`${BASE}/name/${encodeURIComponent(name)}`),

  getActive: (category?: string) =>
    apiClient.get<BillType[]>(`${BASE}/active`, {
      params: category ? { category } : {},
    }),

  getRecurring: () => apiClient.get<BillType[]>(`${BASE}/recurring`),

  getDropdown: (category?: string, isRecurring?: boolean) =>
    apiClient.get<unknown[]>(`${BASE}/dropdown`, {
      params: { category, isRecurring },
    }),

  getByCategory: (category: string) =>
    apiClient.get<BillType[]>(`${BASE}/category/${encodeURIComponent(category)}`),

  search: (q: string, limit = 10) =>
    apiClient.get<BillType[]>(`${BASE}/search`, { params: { q, limit } }),

  getStatistics: () =>
    apiClient.get<BillTypeStatistics>(`${BASE}/statistics`),

  create: (data: CreateBillTypeDto) =>
    apiClient.post<BillType>(BASE, data),

  update: (id: string, data: UpdateBillTypeDto) =>
    apiClient.put<BillType>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  validate: (id: string) =>
    apiClient.get<ValidateConfigurationResult>(`${BASE}/${id}/validate`),

  calculate: (
    billTypeId: string,
    params?: { units?: number; baseAmount?: number; applyTax?: boolean }
  ) =>
    apiClient.get<CalculateAmountResult>(
      `${BASE}/${billTypeId}/calculate`,
      { params }
    ),

  bulkUpdateStatus: (billTypeIds: string[], isActive: boolean) =>
    apiClient.post<{ matched: number; modified: number }>(
      `${BASE}/bulk/update-status`,
      { billTypeIds, isActive }
    ),
};
