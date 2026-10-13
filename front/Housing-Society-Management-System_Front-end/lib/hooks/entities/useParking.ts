// lib/hooks/entities/useParking.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "parking";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useParkingSpots = (params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "spots", queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.type) queryParams.type = params.type;
      if (params.zone) queryParams.zone = params.zone;

      const response = await apiClient.get("/parking/spots", { params: queryParams });
      if (response.data.success) {
        return {
          items: Array.isArray(response.data.data) ? response.data.data : response.data.data.spots ?? [],
          pagination: response.data.pagination ?? response.data.data?.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch parking spots");
    },
  });
};

export const useParkingSpot = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "spot", id],
    queryFn: async () => {
      const response = await apiClient.get(`/parking/spots/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch parking spot");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSpot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/parking/spots", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create parking spot");
    },
    onSuccess: () => {
      customToast.success("Parking spot created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create parking spot");
    },
  });
};

export const useUpdateSpot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`/parking/spots/${id}`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update parking spot");
    },
    onSuccess: (_, variables) => {
      customToast.success("Parking spot updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "spot", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update parking spot");
    },
  });
};

export const useDeleteSpot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/parking/spots/${id}`);
      if (!response.data.success) throw new Error(response.data.message || "Failed to delete parking spot");
    },
    onSuccess: () => {
      customToast.success("Parking spot deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete parking spot");
    },
  });
};

export const useAssignSpot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/parking/spots/${id}/assign`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to assign parking spot");
    },
    onSuccess: (_, variables) => {
      customToast.success("Parking spot assigned successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "spot", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to assign parking spot");
    },
  });
};

export const useUnassignSpot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/parking/spots/${id}/unassign`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to unassign parking spot");
    },
    onSuccess: (_, id) => {
      customToast.success("Parking spot unassigned successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "spot", id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to unassign parking spot");
    },
  });
};

export const useToggleRent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/parking/spots/${id}/rent`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to toggle rent status");
    },
    onSuccess: (_, variables) => {
      customToast.success("Rent status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "spot", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle rent status");
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useParkingPasses = (params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "passes", queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;

      const response = await apiClient.get("/parking/passes", { params: queryParams });
      if (response.data.success) {
        return {
          items: Array.isArray(response.data.data) ? response.data.data : response.data.data.passes ?? [],
          pagination: response.data.pagination ?? response.data.data?.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch parking passes");
    },
  });
};

export const useIssuePass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/parking/passes", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to issue parking pass");
    },
    onSuccess: () => {
      customToast.success("Parking pass issued successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "passes"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to issue parking pass");
    },
  });
};

export const useVerifyPass = (code: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "verify-pass", code],
    queryFn: async () => {
      const response = await apiClient.get(`/parking/passes/verify/${code}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to verify parking pass");
    },
    enabled: !!code,
    staleTime: 0,
  });
};

export const useCancelPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/parking/passes/${id}/cancel`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to cancel parking pass");
    },
    onSuccess: () => {
      customToast.success("Parking pass cancelled successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "passes"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to cancel parking pass");
    },
  });
};

export const useParkingStats = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "stats", societyId],
    queryFn: async () => {
      const response = await apiClient.get(`/parking/stats`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch parking stats");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};
