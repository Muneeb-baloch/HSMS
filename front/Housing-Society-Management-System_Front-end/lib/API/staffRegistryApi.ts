// lib/API/staffRegistryApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  DomesticStaff,
  RegisterStaffDto,
  StaffQueryParams,
  EmploymentRecord,
} from "@/lib/types/staff-registry";

const BASE = "/staff-registry";

export const staffRegistryApi = {
  register: (data: RegisterStaffDto) =>
    apiClient.post<DomesticStaff>(BASE, data),

  getAll: (params: StaffQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.staffType) queryParams.staffType = params.staffType;
    if (params.isVerified !== undefined)
      queryParams.isVerified = params.isVerified;
    if (params.search) queryParams.search = params.search;
    if (params.minRating !== undefined)
      queryParams.minRating = params.minRating;
    if (params.blacklisted !== undefined)
      queryParams.blacklisted = params.blacklisted;

    return apiClient.get<{
      items: DomesticStaff[];
      pagination: PaginatedResponse<DomesticStaff>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getById: (id: string) =>
    apiClient.get<DomesticStaff>(`${BASE}/${id}`),

  update: (id: string, data: Partial<RegisterStaffDto>) =>
    apiClient.put<DomesticStaff>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  verify: (id: string, method: string) =>
    apiClient.patch<DomesticStaff>(`${BASE}/${id}/verify`, {
      verificationMethod: method,
    }),

  addEmployment: (
    id: string,
    data: Omit<EmploymentRecord, "isCurrentlyEmployed">
  ) => apiClient.post<DomesticStaff>(`${BASE}/${id}/employment`, data),

  endEmployment: (
    id: string,
    data: { societyId: string; endDate: string; review?: string }
  ) =>
    apiClient.patch<DomesticStaff>(
      `${BASE}/${id}/employment/end`,
      data
    ),

  rate: (
    id: string,
    data: { societyId: string; rating: number; review?: string }
  ) => apiClient.post<DomesticStaff>(`${BASE}/${id}/rate`, data),

  blacklist: (id: string, reason: string) =>
    apiClient.patch<DomesticStaff>(`${BASE}/${id}/blacklist`, {
      reason,
    }),

  searchByCNIC: (cnic: string) =>
    apiClient.get<DomesticStaff>(`${BASE}/search/cnic/${cnic}`),

  getBySociety: (societyId: string) =>
    apiClient.get<DomesticStaff[]>(`${BASE}/society/${societyId}`),
};
