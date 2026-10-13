import { bulkOperationsApi } from "@/lib/API/bulkOperationsApi";
import type {
  ExportParams,
  ImportParams,
  ImportResult,
  ImportTemplate,
  ImportLog,
  ImportLogQueryParams,
} from "@/lib/types/bulk-operations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "bulk-operations";

export const useExportData = () => {
  return useMutation({
    mutationFn: async (params: ExportParams) => {
      const response = await bulkOperationsApi.exportData(params);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to export data");
    },
    onSuccess: () => {
      customToast.success("Data exported successfully");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to export data");
    },
  });
};

export const useImportData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: ImportParams): Promise<ImportResult> => {
      const response = await bulkOperationsApi.importData(params);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to import data");
    },
    onSuccess: (data) => {
      customToast.success(
        `Import complete: ${data.success} succeeded, ${data.failed} failed`
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to import data");
    },
  });
};

export const useImportTemplate = (entityType: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "template", entityType],
    queryFn: async (): Promise<ImportTemplate> => {
      const response = await bulkOperationsApi.getTemplate(entityType);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch template");
    },
    enabled: !!entityType,
  });
};

export const useImportLogs = (params?: ImportLogQueryParams) => {
  const queryKeyString = JSON.stringify(params);
  return useQuery({
    queryKey: [QUERY_KEY, "logs", queryKeyString],
    queryFn: async () => {
      const response = await bulkOperationsApi.getImportLogs(params);
      if (response.data.success) {
        return {
          items: response.data.data.logs,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch import logs");
    },
  });
};

export const useImportLog = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "logs", id],
    queryFn: async (): Promise<ImportLog> => {
      const response = await bulkOperationsApi.getImportLog(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch import log");
    },
    enabled: !!id,
  });
};

export const useCancelImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await bulkOperationsApi.cancelImport(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to cancel import");
    },
    onSuccess: () => {
      customToast.success("Import cancelled");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to cancel import");
    },
  });
};
