// lib/hooks/entities/useGatePass.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "gate-passes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useGatePasses = (params: Record<string, any> = {}) => {
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

      const response = await apiClient.get("/gate-passes", { params: queryParams });
      if (response.data.success) {
        return {
          items: response.data.data.passes ?? response.data.data,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch gate passes");
    },
  });
};

export const useGatePass = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/gate-passes/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch gate pass");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateGatePass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/gate-passes", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create gate pass");
    },
    onSuccess: () => {
      customToast.success("Gate pass created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create gate pass");
    },
  });
};

export const useUpdateGatePass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`/gate-passes/${id}`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update gate pass");
    },
    onSuccess: (_, variables) => {
      customToast.success("Gate pass updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update gate pass");
    },
  });
};

export const useDeleteGatePass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/gate-passes/${id}`);
      if (!response.data.success) throw new Error(response.data.message || "Failed to delete gate pass");
    },
    onSuccess: () => {
      customToast.success("Gate pass deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete gate pass");
    },
  });
};

export const useApprovePass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/gate-passes/${id}/approve`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to approve gate pass");
    },
    onSuccess: (_, id) => {
      customToast.success("Gate pass approved successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to approve gate pass");
    },
  });
};

export const useRejectPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: Record<string, unknown> }) => {
      const response = await apiClient.post(`/gate-passes/${id}/reject`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to reject gate pass");
    },
    onSuccess: (_, variables) => {
      customToast.success("Gate pass rejected");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to reject gate pass");
    },
  });
};

export const useCheckInPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: Record<string, unknown> }) => {
      const response = await apiClient.post(`/gate-passes/${id}/check-in`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to check in");
    },
    onSuccess: (_, variables) => {
      customToast.success("Checked in successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to check in");
    },
  });
};

export const useCheckOutPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: Record<string, unknown> }) => {
      const response = await apiClient.post(`/gate-passes/${id}/check-out`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to check out");
    },
    onSuccess: (_, variables) => {
      customToast.success("Checked out successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to check out");
    },
  });
};

export const useVerifyPassCode = (code: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "verify", code],
    queryFn: async () => {
      const response = await apiClient.get(`/gate-passes/verify/${code}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to verify pass code");
    },
    enabled: !!code,
    staleTime: 0,
  });
};

export const useCancelGatePass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/gate-passes/${id}/cancel`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to cancel gate pass");
    },
    onSuccess: (_, id) => {
      customToast.success("Gate pass cancelled successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to cancel gate pass");
    },
  });
};

export const useMyGatePasses = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "my-passes"],
    queryFn: async () => {
      const response = await apiClient.get("/gate-passes/my-passes");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch my gate passes");
    },
  });
};

export const useTodaysPasses = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "today", societyId],
    queryFn: async () => {
      const response = await apiClient.get(`/gate-passes/today/${societyId}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch today's passes");
    },
    enabled: !!societyId,
    staleTime: 30 * 1000,
  });
};

export const useGatePassStats = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "stats", societyId],
    queryFn: async () => {
      const response = await apiClient.get(`/gate-passes/stats`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch gate pass stats");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};
