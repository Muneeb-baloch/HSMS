// lib/API/attendanceApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  AttendanceRecord,
  AttendanceSummary,
  Geofence,
  CheckInDto,
  CheckOutDto,
  AttendanceQueryParams,
  CreateGeofenceDto,
  UpdateGeofenceDto,
} from "@/lib/types/attendance";

const BASE = "/attendance";

export const attendanceApi = {
  // Attendance
  checkIn: (data: CheckInDto) =>
    apiClient.post<AttendanceRecord>(`${BASE}/check-in`, data),

  checkOut: (id: string, data: CheckOutDto) =>
    apiClient.patch<AttendanceRecord>(`${BASE}/${id}/check-out`, data),

  getAll: (params: AttendanceQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.staffId) queryParams.staffId = params.staffId;
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.status) queryParams.status = params.status;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return apiClient.get<{
      records: AttendanceRecord[];
      pagination: PaginatedResponse<AttendanceRecord>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getById: (id: string) =>
    apiClient.get<AttendanceRecord>(`${BASE}/${id}`),

  getSummary: (
    staffId: string,
    params: { fromDate?: string; toDate?: string } = {}
  ) => {
    const queryParams: Record<string, unknown> = {};
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return apiClient.get<AttendanceSummary>(
      `${BASE}/summary/staff/${staffId}`,
      { params: queryParams }
    );
  },

  getSocietySummary: (
    societyId: string,
    params: { fromDate?: string; toDate?: string } = {}
  ) => {
    const queryParams: Record<string, unknown> = {};
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return apiClient.get<AttendanceSummary>(
      `${BASE}/summary/society/${societyId}`,
      { params: queryParams }
    );
  },

  // Geofences
  getGeofences: (societyId: string) =>
    apiClient.get<Geofence[]>(
      `${BASE}/geofences/society/${societyId}`
    ),

  createGeofence: (data: CreateGeofenceDto) =>
    apiClient.post<Geofence>(`${BASE}/geofences`, data),

  updateGeofence: (id: string, data: UpdateGeofenceDto) =>
    apiClient.put<Geofence>(`${BASE}/geofences/${id}`, data),

  deleteGeofence: (id: string) =>
    apiClient.delete(`${BASE}/geofences/${id}`),
};
