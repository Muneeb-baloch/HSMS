// lib/API/plraApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  PLRACertificate,
  PLRASyncLog,
  ComplianceDashboard,
  GenerateCertificateDto,
  UpdateCertificateDto,
  CertificateQueryParams,
} from "@/lib/types/plra";

const BASE = "/plra";

export const plraApi = {
  getCertificates: (params: CertificateQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.plotId) queryParams.plotId = params.plotId;
    if (params.memberId) queryParams.memberId = params.memberId;
    if (params.certificateType)
      queryParams.certificateType = params.certificateType;
    if (params.status) queryParams.status = params.status;
    if (params.syncStatus) queryParams.syncStatus = params.syncStatus;

    return apiClient.get<{
      certificates: PLRACertificate[];
      pagination: PaginatedResponse<PLRACertificate>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getCertificateById: (id: string) =>
    apiClient.get<PLRACertificate>(`${BASE}/${id}`),

  generateCertificate: (data: GenerateCertificateDto) =>
    apiClient.post<PLRACertificate>(`${BASE}/generate`, data),

  updateCertificate: (id: string, data: UpdateCertificateDto) =>
    apiClient.put<PLRACertificate>(`${BASE}/${id}`, data),

  revokeCertificate: (id: string, data: { reason?: string } = {}) =>
    apiClient.patch<PLRACertificate>(`${BASE}/${id}/revoke`, data),

  verifyCertificate: (qrCode: string) =>
    apiClient.post<{ valid: boolean; certificate?: PLRACertificate }>(
      `${BASE}/verify`,
      { qrCode }
    ),

  syncCertificate: (id: string) =>
    apiClient.post<PLRACertificate>(`${BASE}/${id}/sync`),

  getSyncLogs: (
    certificateId: string,
    params: { page?: number; limit?: number } = {}
  ) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };

    return apiClient.get<{
      logs: PLRASyncLog[];
      pagination: PaginatedResponse<PLRASyncLog>["pagination"];
    }>(`${BASE}/${certificateId}/sync-logs`, { params: queryParams });
  },

  getCompliance: (societyId: string) =>
    apiClient.get<ComplianceDashboard>(
      `${BASE}/compliance/${societyId}`
    ),
};
