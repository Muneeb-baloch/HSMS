import { apiClient } from "@/lib/API/client";
import type {
  ExportParams,
  ImportParams,
  ImportResult,
  ImportTemplate,
  ImportLog,
  ImportLogQueryParams,
} from "@/lib/types/bulk-operations";

const BASE = "/bulk-operations";

export const bulkOperationsApi = {
  exportData: (params: ExportParams) =>
    apiClient.post(`${BASE}/export`, params),

  importData: (params: ImportParams) =>
    apiClient.post<ImportResult>(`${BASE}/import`, params),

  getTemplate: (entityType: string) =>
    apiClient.get<ImportTemplate>(`${BASE}/templates/${entityType}`),

  getImportLogs: (params?: ImportLogQueryParams) => {
    const queryParams: Record<string, unknown> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.entityType) queryParams.entityType = params.entityType;
    if (params?.status) queryParams.status = params.status;
    return apiClient.get<{
      logs: ImportLog[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`${BASE}/logs`, { params: queryParams });
  },

  getImportLog: (id: string) =>
    apiClient.get<ImportLog>(`${BASE}/logs/${id}`),

  cancelImport: (id: string) =>
    apiClient.post(`${BASE}/logs/${id}/cancel`),
};
