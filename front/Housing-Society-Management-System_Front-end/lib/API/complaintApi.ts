// src/lib/API/complaintApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  Complaint,
  ComplaintQueryParams,
  CreateComplaintDto,
  UpdateComplaintDto,
  AssignComplaintDto,
  ResolveComplaintDto,
  EscalateComplaintDto,
} from "@/lib/types/complaint";

const BASE = "/complaint";

export const complaintApi = {
  getComplaints: (params: ComplaintQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search) queryParams.search = params.search;
    if (params.memId) queryParams.memId = params.memId;
    if (params.fileId) queryParams.fileId = params.fileId;
    if (params.compCatId) queryParams.compCatId = params.compCatId;
    if (params.statusId) queryParams.statusId = params.statusId;
    if (params.compPriority) queryParams.compPriority = params.compPriority;
    if (params.assignedTo) queryParams.assignedTo = params.assignedTo;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    return apiClient.get<{
      complaints: Complaint[];
      pagination: PaginatedResponse<Complaint>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getComplaint: (id: string) => apiClient.get<Complaint>(`${BASE}/${id}`),

  create: (data: CreateComplaintDto) => apiClient.post<Complaint>(BASE, data),

  update: (id: string, data: UpdateComplaintDto) =>
    apiClient.put<Complaint>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  assign: (id: string, data: AssignComplaintDto) =>
    apiClient.patch<Complaint>(`${BASE}/${id}/assign`, data),

  resolve: (id: string, data: ResolveComplaintDto) =>
    apiClient.patch<Complaint>(`${BASE}/${id}/resolve`, data),

  escalate: (id: string, data: EscalateComplaintDto) =>
    apiClient.patch<Complaint>(`${BASE}/${id}/escalate`, data),
};
