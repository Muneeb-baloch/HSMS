// lib/hooks/entities/useEmergency.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "emergency";

export const useTriggerAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/emergency/alerts", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to trigger alert");
    },
    onSuccess: () => {
      customToast.success("Emergency alert triggered successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to trigger alert");
    },
  });
};

export const useActiveAlerts = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async () => {
      const response = await apiClient.get("/emergency/alerts/active");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch active alerts");
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAlertHistory = (params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "history", queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;
      if (params.search) queryParams.search = params.search;
      if (params.type) queryParams.type = params.type;
      if (params.severity) queryParams.severity = params.severity;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get("/emergency/alerts/history", { params: queryParams });
      if (response.data.success) {
        return {
          items: Array.isArray(response.data.data) ? response.data.data : response.data.data.alerts ?? [],
          pagination: response.data.pagination ?? response.data.data?.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch alert history");
    },
  });
};

export const useAlert = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/emergency/alerts/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch alert");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRespondToAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/emergency/alerts/${id}/respond`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to respond to alert");
    },
    onSuccess: (_, variables) => {
      customToast.success("Response recorded successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to respond to alert");
    },
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: Record<string, unknown> }) => {
      const response = await apiClient.post(`/emergency/alerts/${id}/resolve`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to resolve alert");
    },
    onSuccess: (_, variables) => {
      customToast.success("Alert resolved successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to resolve alert");
    },
  });
};

export const useMarkFalseAlarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: Record<string, unknown> }) => {
      const response = await apiClient.post(`/emergency/alerts/${id}/false-alarm`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to mark as false alarm");
    },
    onSuccess: (_, variables) => {
      customToast.success("Marked as false alarm");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to mark as false alarm");
    },
  });
};

export const useMedicalProfile = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "medical-profile"],
    queryFn: async () => {
      const response = await apiClient.get("/emergency/medical-profile");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch medical profile");
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpdateMedicalProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.put("/emergency/medical-profile", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update medical profile");
    },
    onSuccess: () => {
      customToast.success("Medical profile updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "medical-profile"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update medical profile");
    },
  });
};

export const useAllMedicalProfiles = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "medical-profiles"],
    queryFn: async () => {
      const response = await apiClient.get("/emergency/medical-profiles");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch medical profiles");
    },
    staleTime: 5 * 60 * 1000,
  });
};
