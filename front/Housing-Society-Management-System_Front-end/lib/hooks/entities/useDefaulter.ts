import { defaulterApi } from "@/lib/API/defaulterApi";
import {
  DefaulterQueryParams,
  SendNoticeDto,
  SetRemarksDto,
  SetStatusOverrideDto,
} from "@/lib/types/defaulter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "defaulters";

export const useDefaulters = (params: DefaulterQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);
  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const response = await defaulterApi.getDefaulters(params);
      if (response.data.success) {
        return {
          items: response.data.data.defaulters,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch defaulters");
    },
  });
};

export const useDefaulterStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await defaulterApi.getStatistics();
      if (response.data.success) return response.data.data;
      throw new Error("Failed to fetch statistics");
    },
  });
};

export const useDefaulter = (fileId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, fileId],
    queryFn: async () => {
      const response = await defaulterApi.getDefaulter(fileId);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch defaulter");
    },
    enabled: !!fileId,
  });
};

export const useSetStatusOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId, data }: { fileId: string; data: SetStatusOverrideDto }) => {
      const response = await defaulterApi.setStatusOverride(fileId, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update status");
    },
    onSuccess: (data) => {
      customToast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (data) queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.fileId] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update status");
    },
  });
};

export const useSetRemarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId, data }: { fileId: string; data: SetRemarksDto }) => {
      const response = await defaulterApi.setRemarks(fileId, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update remarks");
    },
    onSuccess: (data) => {
      customToast.success("Remarks updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (data) queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.fileId] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update remarks");
    },
  });
};

export const useSendNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId, data }: { fileId: string; data: SendNoticeDto }) => {
      const response = await defaulterApi.sendNotice(fileId, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to send notice");
    },
    onSuccess: (data) => {
      customToast.success("Notice sent successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (data) queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.fileId] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to send notice");
    },
  });
};
