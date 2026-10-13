// lib/API/emergencyApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  EmergencyAlert,
  MedicalProfile,
  TriggerAlertDto,
  EmergencyQueryParams,
  UpdateMedicalProfileDto,
} from "@/lib/types/emergency";

const BASE = "/emergency";

export const emergencyApi = {
  triggerAlert: (data: TriggerAlertDto) =>
    apiClient.post<EmergencyAlert>(`${BASE}/alerts`, data),

  getActiveAlerts: () =>
    apiClient.get<EmergencyAlert[]>(`${BASE}/alerts/active`),

  getAlertHistory: (params: EmergencyQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.alertType) queryParams.alertType = params.alertType;
    if (params.severity) queryParams.severity = params.severity;
    if (params.status) queryParams.status = params.status;

    return apiClient.get<{
      items: EmergencyAlert[];
      pagination: PaginatedResponse<EmergencyAlert>["pagination"];
    }>(`${BASE}/alerts`, { params: queryParams });
  },

  getAlertById: (id: string) =>
    apiClient.get<EmergencyAlert>(`${BASE}/alerts/${id}`),

  respondToAlert: (id: string, action: string) =>
    apiClient.patch<EmergencyAlert>(`${BASE}/alerts/${id}/respond`, {
      action,
    }),

  resolveAlert: (id: string, notes: string) =>
    apiClient.patch<EmergencyAlert>(`${BASE}/alerts/${id}/resolve`, {
      resolutionNotes: notes,
    }),

  markFalseAlarm: (id: string) =>
    apiClient.patch<EmergencyAlert>(`${BASE}/alerts/${id}/false-alarm`, {}),

  getMedicalProfile: () =>
    apiClient.get<MedicalProfile>(`${BASE}/medical-profile`),

  updateMedicalProfile: (data: UpdateMedicalProfileDto) =>
    apiClient.put<MedicalProfile>(`${BASE}/medical-profile`, data),

  getAllMedicalProfiles: () =>
    apiClient.get<MedicalProfile[]>(`${BASE}/medical-profiles`),
};
