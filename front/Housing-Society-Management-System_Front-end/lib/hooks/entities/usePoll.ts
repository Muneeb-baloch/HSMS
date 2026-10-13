// lib/hooks/entities/usePoll.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "polls";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usePolls = (params: Record<string, any> = {}) => {
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

      const response = await apiClient.get("/polls", { params: queryParams });
      if (response.data.success) {
        return {
          items: Array.isArray(response.data.data) ? response.data.data : response.data.data.polls ?? [],
          pagination: response.data.pagination ?? response.data.data?.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch polls");
    },
  });
};

export const usePoll = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/polls/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch poll");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/polls", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create poll");
    },
    onSuccess: () => {
      customToast.success("Poll created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create poll");
    },
  });
};

export const useUpdatePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`/polls/${id}`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update poll");
    },
    onSuccess: (_, variables) => {
      customToast.success("Poll updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update poll");
    },
  });
};

export const useDeletePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/polls/${id}`);
      if (!response.data.success) throw new Error(response.data.message || "Failed to delete poll");
    },
    onSuccess: () => {
      customToast.success("Poll deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete poll");
    },
  });
};

export const useCastVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, data }: { pollId: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/polls/${pollId}/vote`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to cast vote");
    },
    onSuccess: (_, variables) => {
      customToast.success("Vote cast successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.pollId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "results", variables.pollId] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to cast vote");
    },
  });
};

export const usePollResults = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "results", id],
    queryFn: async () => {
      const response = await apiClient.get(`/polls/${id}/results`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch poll results");
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

export const useClosePoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/polls/${id}/close`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to close poll");
    },
    onSuccess: (_, id) => {
      customToast.success("Poll closed successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to close poll");
    },
  });
};
