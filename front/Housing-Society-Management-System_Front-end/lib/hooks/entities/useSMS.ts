// lib/hooks/entities/useSMS.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "sms";

export const useSendSMS = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/sms/send", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to send SMS");
    },
    onSuccess: () => {
      customToast.success("SMS sent successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to send SMS");
    },
  });
};

export const useSendBulkSMS = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/sms/send-bulk", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to send bulk SMS");
    },
    onSuccess: () => {
      customToast.success("Bulk SMS sent successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to send bulk SMS");
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSMSLogs = (params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "logs", queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get("/sms/logs", { params: queryParams });
      if (response.data.success) {
        return {
          items: response.data.data.logs ?? response.data.data,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch SMS logs");
    },
  });
};

export const useSMSStats = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "stats", societyId],
    queryFn: async () => {
      const response = await apiClient.get(`/sms/stats`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch SMS stats");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};
