// lib/API/maintenanceRequestApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  MaintenanceRequest,
  CreateMaintenanceDto,
  MaintenanceQueryParams,
  WorkLogEntry,
} from "@/lib/types/maintenance-request";

const BASE = "/maintenance-requests";

export const maintenanceRequestApi = {
  getAll: (params: MaintenanceQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.category) queryParams.category = params.category;
    if (params.priority) queryParams.priority = params.priority;
    if (params.status) queryParams.status = params.status;
    if (params.assignedTo) queryParams.assignedTo = params.assignedTo;
    if (params.isOverdue !== undefined)
      queryParams.isOverdue = params.isOverdue;
    if (params.search) queryParams.search = params.search;

    return apiClient.get<{
      items: MaintenanceRequest[];
      pagination: PaginatedResponse<MaintenanceRequest>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getById: (id: string) =>
    apiClient.get<MaintenanceRequest>(`${BASE}/${id}`),

  create: (data: CreateMaintenanceDto) =>
    apiClient.post<MaintenanceRequest>(BASE, data),

  update: (id: string, data: Partial<CreateMaintenanceDto>) =>
    apiClient.put<MaintenanceRequest>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  acknowledge: (id: string) =>
    apiClient.patch<MaintenanceRequest>(`${BASE}/${id}/acknowledge`, {}),

  assignToStaff: (id: string, staffId: string) =>
    apiClient.patch<MaintenanceRequest>(`${BASE}/${id}/assign-staff`, {
      staffId,
    }),

  assignToVendor: (
    id: string,
    vendorId: string,
    estimatedCost: number,
    estimatedCompletionDate: string
  ) =>
    apiClient.patch<MaintenanceRequest>(`${BASE}/${id}/assign-vendor`, {
      vendorId,
      estimatedCost,
      estimatedCompletionDate,
    }),

  startWork: (id: string) =>
    apiClient.patch<MaintenanceRequest>(`${BASE}/${id}/start`, {}),

  addWorkLog: (id: string, log: Omit<WorkLogEntry, "loggedBy">) =>
    apiClient.post<MaintenanceRequest>(`${BASE}/${id}/work-log`, log),

  completeWork: (id: string) =>
    apiClient.patch<MaintenanceRequest>(`${BASE}/${id}/complete`, {}),

  verifyCompletion: (id: string) =>
    apiClient.patch<MaintenanceRequest>(`${BASE}/${id}/verify`, {}),

  submitFeedback: (id: string, rating: number, comment: string) =>
    apiClient.post<MaintenanceRequest>(`${BASE}/${id}/feedback`, {
      rating,
      comment,
    }),

  reject: (id: string, reason: string) =>
    apiClient.patch<MaintenanceRequest>(`${BASE}/${id}/reject`, {
      rejectionReason: reason,
    }),

  getMyRequests: () =>
    apiClient.get<MaintenanceRequest[]>(`${BASE}/my-requests`),

  getAssignedRequests: () =>
    apiClient.get<MaintenanceRequest[]>(`${BASE}/assigned`),

  getOverdueRequests: (societyId: string) =>
    apiClient.get<MaintenanceRequest[]>(`${BASE}/overdue/${societyId}`),

  getStats: (societyId: string) =>
    apiClient.get<Record<string, unknown>>(`${BASE}/stats/${societyId}`),
};
