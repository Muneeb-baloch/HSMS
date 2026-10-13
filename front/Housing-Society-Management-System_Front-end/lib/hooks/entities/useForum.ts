// lib/hooks/entities/useForum.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "forum";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useThreads = (params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "threads", queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;
      if (params.search) queryParams.search = params.search;
      if (params.category) queryParams.category = params.category;
      if (params.status) queryParams.status = params.status;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.tag) queryParams.tag = params.tag;

      const response = await apiClient.get("/forum/threads", { params: queryParams });
      if (response.data.success) {
        return {
          items: Array.isArray(response.data.data) ? response.data.data : response.data.data.threads ?? [],
          pagination: response.data.pagination ?? response.data.data?.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch threads");
    },
  });
};

export const useThread = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "thread", id],
    queryFn: async () => {
      const response = await apiClient.get(`/forum/threads/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch thread");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/forum/threads", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create thread");
    },
    onSuccess: () => {
      customToast.success("Thread created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create thread");
    },
  });
};

export const useUpdateThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`/forum/threads/${id}`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update thread");
    },
    onSuccess: (_, variables) => {
      customToast.success("Thread updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "thread", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update thread");
    },
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/forum/threads/${id}`);
      if (!response.data.success) throw new Error(response.data.message || "Failed to delete thread");
    },
    onSuccess: () => {
      customToast.success("Thread deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete thread");
    },
  });
};

export const usePinThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/forum/threads/${id}/pin`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to pin thread");
    },
    onSuccess: (_, id) => {
      customToast.success("Thread pinned successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "thread", id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to pin thread");
    },
  });
};

export const useLockThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/forum/threads/${id}/lock`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to lock thread");
    },
    onSuccess: (_, id) => {
      customToast.success("Thread locked successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "thread", id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to lock thread");
    },
  });
};

export const useLikeThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/forum/threads/${id}/like`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to like thread");
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "thread", id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to like thread");
    },
  });
};

export const useFlagThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/forum/threads/${id}/flag`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to flag thread");
    },
    onSuccess: (_, variables) => {
      customToast.success("Thread flagged successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "thread", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to flag thread");
    },
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useReplies = (threadId: string, params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "replies", threadId, queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;

      const response = await apiClient.get(`/forum/threads/${threadId}/replies`, { params: queryParams });
      if (response.data.success) {
        return {
          items: Array.isArray(response.data.data) ? response.data.data : response.data.data.replies ?? [],
          pagination: response.data.pagination ?? response.data.data?.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch replies");
    },
    enabled: !!threadId,
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, data }: { threadId: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/forum/threads/${threadId}/replies`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create reply");
    },
    onSuccess: (_, variables) => {
      customToast.success("Reply posted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "replies", variables.threadId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "thread", variables.threadId] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create reply");
    },
  });
};

export const useDeleteReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, replyId }: { threadId: string; replyId: string }) => {
      const response = await apiClient.delete(`/forum/threads/${threadId}/replies/${replyId}`);
      if (!response.data.success) throw new Error(response.data.message || "Failed to delete reply");
    },
    onSuccess: (_, variables) => {
      customToast.success("Reply deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "replies", variables.threadId] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete reply");
    },
  });
};

export const useLikeReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, replyId }: { threadId: string; replyId: string }) => {
      const response = await apiClient.post(`/forum/threads/${threadId}/replies/${replyId}/like`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to like reply");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "replies", variables.threadId] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to like reply");
    },
  });
};

export const useForumStats = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "stats", societyId],
    queryFn: async () => {
      const response = await apiClient.get(`/forum/stats`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch forum stats");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};
