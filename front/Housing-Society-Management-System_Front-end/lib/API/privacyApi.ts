// lib/API/privacyApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  PrivacySettings,
  UpdatePrivacySettingsDto,
  PrivacyAccessLog,
  PrivacyScore,
} from "@/lib/types/privacy";

const BASE = "/privacy";

export const privacyApi = {
  getSettings: () =>
    apiClient.get<PrivacySettings>(`${BASE}/settings`),

  updateSettings: (data: UpdatePrivacySettingsDto) =>
    apiClient.put<PrivacySettings>(`${BASE}/settings`, data),

  getSettingsByMember: (memberId: string) =>
    apiClient.get<PrivacySettings>(`${BASE}/settings/member/${memberId}`),

  getAccessLog: (params: { page?: number; limit?: number } = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };

    return apiClient.get<{
      logs: PrivacyAccessLog[];
      pagination: PaginatedResponse<PrivacyAccessLog>["pagination"];
    }>(`${BASE}/access-log`, { params: queryParams });
  },

  requestExport: () =>
    apiClient.post<{ requestId: string; status: string }>(
      `${BASE}/export`
    ),

  requestDeletion: () =>
    apiClient.post<{ requestId: string; status: string }>(
      `${BASE}/deletion`
    ),

  getConsents: () =>
    apiClient.get<{ dataRetentionConsent: boolean; marketingConsent: boolean; thirdPartySharing: boolean }>(
      `${BASE}/consents`
    ),

  updateConsent: (data: { consentType: string; granted: boolean }) =>
    apiClient.patch(`${BASE}/consents`, data),

  getScore: () =>
    apiClient.get<PrivacyScore>(`${BASE}/score`),
};
