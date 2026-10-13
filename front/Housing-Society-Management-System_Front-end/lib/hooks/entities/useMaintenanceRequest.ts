// lib/hooks/entities/useMaintenanceRequest.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "maintenance-requests";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useMaintenanceRequests = (params: Record<string, any> = {}) => {
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
      if (params.priority) queryParams.priority = params.priority;
      if (params.category) queryParams.category = params.category;
      if (params.assignedTo) queryParams.assignedTo = params.assignedTo;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get("/maintenance-requests", { params: queryParams });
      if (response.data.success) {
        return {
          items: response.data.data.requests ?? response.data.data,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch maintenance requests");
    },
  });
};

export const useMaintenanceRequest = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/maintenance-requests/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch maintenance request");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/maintenance-requests", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create maintenance request");
    },
    onSuccess: () => {
      customToast.success("Maintenance request created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create maintenance request");
    },
  });
};

export const useUpdateMaintenanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`/maintenance-requests/${id}`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update maintenance request");
    },
    onSuccess: (_, variables) => {
      customToast.success("Maintenance request updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update maintenance request");
    },
  });
};

export const useDeleteMaintenanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/maintenance-requests/${id}`);
      if (!response.data.success) throw new Error(response.data.message || "Failed to delete maintenance request");
    },
    onSuccess: () => {
      customToast.success("Maintenance request deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete maintenance request");
    },
  });
};

export const useAcknowledgeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/maintenance-requests/${id}/acknowledge`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to acknowledge request");
    },
    onSuccess: (_, id) => {
      customToast.success("Request acknowledged successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to acknowledge request");
    },
  });
};

export const useAssignToStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/maintenance-requests/${id}/assign-staff`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to assign to staff");
    },
    onSuccess: (_, variables) => {
      customToast.success("Assigned to staff successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to assign to staff");
    },
  });
};

export const useAssignToVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/maintenance-requests/${id}/assign-vendor`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to assign to vendor");
    },
    onSuccess: (_, variables) => {
      customToast.success("Assigned to vendor successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to assign to vendor");
    },
  });
};

export const useStartWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/maintenance-requests/${id}/start-work`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to start work");
    },
    onSuccess: (_, id) => {
      customToast.success("Work started successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to start work");
    },
  });
};

export const useAddWorkLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/maintenance-requests/${id}/work-log`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to add work log");
    },
    onSuccess: (_, variables) => {
      customToast.success("Work log added successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to add work log");
    },
  });
};

export const useCompleteWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: Record<string, unknown> }) => {
      const response = await apiClient.post(`/maintenance-requests/${id}/complete`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to complete work");
    },
    onSuccess: (_, variables) => {
      customToast.success("Work completed successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to complete work");
    },
  });
};

export const useVerifyCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/maintenance-requests/${id}/verify`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to verify completion");
    },
    onSuccess: (_, variables) => {
      customToast.success("Completion verified successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to verify completion");
    },
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/maintenance-requests/${id}/feedback`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to submit feedback");
    },
    onSuccess: (_, variables) => {
      customToast.success("Feedback submitted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to submit feedback");
    },
  });
};

export const useRejectRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/maintenance-requests/${id}/reject`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to reject request");
    },
    onSuccess: (_, variables) => {
      customToast.success("Request rejected");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to reject request");
    },
  });
};

export const useMyMaintenanceRequests = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "my-requests"],
    queryFn: async () => {
      const response = await apiClient.get("/maintenance-requests/my-requests");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch my maintenance requests");
    },
  });
};

export const useAssignedRequests = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "assigned"],
    queryFn: async () => {
      const response = await apiClient.get("/maintenance-requests/assigned");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch assigned requests");
    },
  });
};

export const useOverdueRequests = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "overdue", societyId],
    queryFn: async () => {
      const response = await apiClient.get(`/maintenance-requests/overdue/${societyId}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch overdue requests");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMaintenanceStats = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "stats", societyId],
    queryFn: async () => {
      const response = await apiClient.get(`/maintenance-requests/stats`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch maintenance stats");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};
