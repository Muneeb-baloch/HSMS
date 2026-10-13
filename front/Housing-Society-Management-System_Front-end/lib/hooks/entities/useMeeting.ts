// lib/hooks/entities/useMeeting.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "meetings";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useMeetings = (params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.type) queryParams.type = params.type;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get("/meetings", { params: queryParams });
      if (response.data.success) {
        return {
          items: Array.isArray(response.data.data) ? response.data.data : response.data.data.meetings ?? [],
          pagination: response.data.pagination ?? response.data.data?.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch meetings");
    },
  });
};

export const useMeeting = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/meetings/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch meeting");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/meetings", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create meeting");
    },
    onSuccess: () => {
      customToast.success("Meeting created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create meeting");
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`/meetings/${id}`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update meeting");
    },
    onSuccess: (_, variables) => {
      customToast.success("Meeting updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update meeting");
    },
  });
};

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/meetings/${id}`);
      if (!response.data.success) throw new Error(response.data.message || "Failed to delete meeting");
    },
    onSuccess: () => {
      customToast.success("Meeting deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete meeting");
    },
  });
};

export const useAddAgendaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/meetings/${id}/agenda`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to add agenda item");
    },
    onSuccess: (_, variables) => {
      customToast.success("Agenda item added successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to add agenda item");
    },
  });
};

export const useUpdateMinutes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`/meetings/${id}/minutes`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update minutes");
    },
    onSuccess: (_, variables) => {
      customToast.success("Minutes updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update minutes");
    },
  });
};

export const useRecordAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/meetings/${id}/attendance`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to record attendance");
    },
    onSuccess: (_, variables) => {
      customToast.success("Attendance recorded successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to record attendance");
    },
  });
};

export const useAddDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/meetings/${id}/decisions`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to add decision");
    },
    onSuccess: (_, variables) => {
      customToast.success("Decision added successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to add decision");
    },
  });
};

export const useCompleteMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/meetings/${id}/complete`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to complete meeting");
    },
    onSuccess: (_, id) => {
      customToast.success("Meeting completed successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to complete meeting");
    },
  });
};
