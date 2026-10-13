// lib/API/gatePassApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  GatePass,
  CreateGatePassDto,
  GatePassQueryParams,
} from "@/lib/types/gate-pass";

const BASE = "/gate-passes";

export const gatePassApi = {
  getAll: (params: GatePassQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.passType) queryParams.passType = params.passType;
    if (params.status) queryParams.status = params.status;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return apiClient.get<{
      items: GatePass[];
      pagination: PaginatedResponse<GatePass>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getById: (id: string) =>
    apiClient.get<GatePass>(`${BASE}/${id}`),

  create: (data: CreateGatePassDto) =>
    apiClient.post<GatePass>(BASE, data),

  update: (id: string, data: Partial<CreateGatePassDto>) =>
    apiClient.put<GatePass>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  approve: (id: string) =>
    apiClient.patch<GatePass>(`${BASE}/${id}/approve`, {}),

  reject: (id: string, reason: string) =>
    apiClient.patch<GatePass>(`${BASE}/${id}/reject`, {
      rejectionReason: reason,
    }),

  checkIn: (id: string, notes?: string) =>
    apiClient.patch<GatePass>(`${BASE}/${id}/check-in`, {
      securityNotes: notes,
    }),

  checkOut: (id: string, notes?: string) =>
    apiClient.patch<GatePass>(`${BASE}/${id}/check-out`, {
      securityNotes: notes,
    }),

  verifyPassCode: (code: string) =>
    apiClient.get<GatePass>(`${BASE}/verify/${code}`),

  cancel: (id: string) =>
    apiClient.patch<GatePass>(`${BASE}/${id}/cancel`, {}),

  getMyPasses: () =>
    apiClient.get<GatePass[]>(`${BASE}/my-passes`),

  getTodaysPasses: (societyId: string) =>
    apiClient.get<GatePass[]>(`${BASE}/today/${societyId}`),

  getStats: (societyId: string) =>
    apiClient.get<Record<string, unknown>>(`${BASE}/stats/${societyId}`),
};
