// src/lib/API/registryApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  Registry,
  RegistryQueryParams,
  RegistrySearchParams,
  CreateRegistryDto,
  UpdateRegistryDto,
  VerifyRegistryDto,
} from "@/lib/types/registry";

const BASE = "/registry";

export const registryApi = {
  getRegistries: (params: RegistryQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search) queryParams.search = params.search;
    if (params.plotId) queryParams.plotId = params.plotId;
    if (params.memId) queryParams.memId = params.memId;
    if (params.registryNo) queryParams.registryNo = params.registryNo;
    if (params.mutationNo) queryParams.mutationNo = params.mutationNo;
    if (params.mozaVillage) queryParams.mozaVillage = params.mozaVillage;
    if (params.khasraNo) queryParams.khasraNo = params.khasraNo;
    if (params.khewatNo) queryParams.khewatNo = params.khewatNo;
    if (params.khatoniNo) queryParams.khatoniNo = params.khatoniNo;
    if (params.subRegistrarName) queryParams.subRegistrarName = params.subRegistrarName;
    if (params.year) queryParams.year = params.year;
    if (params.verificationStatus) queryParams.verificationStatus = params.verificationStatus;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    return apiClient.get<{
      registries: Registry[];
      summary: unknown;
      pagination: PaginatedResponse<Registry>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getRegistry: (id: string) => apiClient.get<Registry>(`${BASE}/${id}`),

  getRegistryByNumber: (registryNo: string) =>
    apiClient.get<Registry>(`${BASE}/registry-no/${encodeURIComponent(registryNo)}`),

  getRegistryByMutationNo: (mutationNo: string) =>
    apiClient.get<Registry>(`${BASE}/mutation-no/${encodeURIComponent(mutationNo)}`),

  getRegistriesByPlot: (plotId: string, page = 1, limit = 10) =>
    apiClient.get<{ registries: Registry[]; total: number; pages: number }>(
      `${BASE}/plot/${plotId}`,
      { params: { page, limit } }
    ),

  getRegistriesByMember: (memId: string, page = 1, limit = 10) =>
    apiClient.get<{ registries: Registry[]; total: number; pages: number }>(
      `${BASE}/member/${memId}`,
      { params: { page, limit } }
    ),

  getRegistriesByYear: (year: number) =>
    apiClient.get<Registry[]>(`${BASE}/year/${year}`),

  getRegistriesBySubRegistrar: (subRegistrarName: string, page = 1, limit = 10) =>
    apiClient.get<{ registries: Registry[]; total: number; pages: number }>(
      `${BASE}/sub-registrar/${encodeURIComponent(subRegistrarName)}`,
      { params: { page, limit } }
    ),

  getStatistics: () =>
    apiClient.get<unknown>(`${BASE}/statistics`),

  getTimeline: (days?: number) =>
    apiClient.get<unknown>(`${BASE}/timeline`, {
      params: days ? { days } : undefined,
    }),

  search: (params: RegistrySearchParams) =>
    apiClient.get<Registry[]>(`${BASE}/search`, { params: params as Record<string, unknown> }),

  getPendingVerifications: (page = 1, limit = 20) =>
    apiClient.get<{
      registries: Registry[];
      total: number;
      pages: number;
    }>(`${BASE}/pending-verifications`, { params: { page, limit } }),

  create: (data: CreateRegistryDto) => apiClient.post<Registry>(BASE, data),

  update: (id: string, data: UpdateRegistryDto) =>
    apiClient.put<Registry>(`${BASE}/${id}`, data),

  bulkUpdate: (registryIds: string[], data: Partial<UpdateRegistryDto>) =>
    apiClient.post(`${BASE}/bulk-update`, { registryIds, ...data }),

  verify: (id: string, data: VerifyRegistryDto) =>
    apiClient.patch<Registry>(`${BASE}/${id}/verify`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
