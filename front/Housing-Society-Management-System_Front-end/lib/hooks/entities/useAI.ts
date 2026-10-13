// lib/hooks/entities/useAI.ts
import { aiApi } from "@/lib/API/aiApi";
import {
  AIConversation,
  AIInsight,
  ChatDto,
  ChatResponse,
  AIQueryParams,
  InsightQueryParams,
} from "@/lib/types/ai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const CONVERSATION_KEY = "ai-conversations";
const INSIGHT_KEY = "ai-insights";

// ── Chat ──────────────────────────────────────────────────────

export const useAIChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ChatDto): Promise<ChatResponse> => {
      const response = await aiApi.chat(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to send chat message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONVERSATION_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to send chat message");
    },
  });
};

// ── Conversations ─────────────────────────────────────────────

export const useAIConversations = (params: AIQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [CONVERSATION_KEY, queryKeyString],
    queryFn: async () => {
      const response = await aiApi.getConversations(params);
      if (response.data.success) {
        return {
          items: response.data.data.conversations,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch AI conversations"
      );
    },
  });
};

export const useAIConversation = (id: string) => {
  return useQuery({
    queryKey: [CONVERSATION_KEY, id],
    queryFn: async () => {
      const response = await aiApi.getConversation(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch AI conversation"
      );
    },
    enabled: !!id,
  });
};

export const useDeleteAIConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await aiApi.deleteConversation(id);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete AI conversation"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Conversation deleted successfully");
      queryClient.invalidateQueries({ queryKey: [CONVERSATION_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete conversation");
    },
  });
};

export const useArchiveAIConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<AIConversation> => {
      const response = await aiApi.archiveConversation(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to archive AI conversation"
      );
    },
    onSuccess: (data) => {
      customToast.success("Conversation archived successfully");
      queryClient.invalidateQueries({ queryKey: [CONVERSATION_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CONVERSATION_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to archive conversation");
    },
  });
};

// ── Insights ──────────────────────────────────────────────────

export const useAIInsights = (params: InsightQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [INSIGHT_KEY, queryKeyString],
    queryFn: async () => {
      const response = await aiApi.getInsights(params);
      if (response.data.success) {
        return {
          items: response.data.data.insights,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch AI insights"
      );
    },
  });
};

export const useCreateAIInsight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<AIInsight, "_id" | "createdAt">
    ): Promise<AIInsight> => {
      const response = await aiApi.createInsight(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to create AI insight"
      );
    },
    onSuccess: () => {
      customToast.success("AI insight created successfully");
      queryClient.invalidateQueries({ queryKey: [INSIGHT_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create AI insight");
    },
  });
};

export const useAcknowledgeAIInsight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<AIInsight> => {
      const response = await aiApi.acknowledgeInsight(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to acknowledge AI insight"
      );
    },
    onSuccess: (data) => {
      customToast.success("Insight acknowledged");
      queryClient.invalidateQueries({ queryKey: [INSIGHT_KEY] });
      queryClient.invalidateQueries({
        queryKey: [INSIGHT_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to acknowledge insight");
    },
  });
};

export const useDeleteAIInsight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await aiApi.deleteInsight(id);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete AI insight"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Insight deleted successfully");
      queryClient.invalidateQueries({ queryKey: [INSIGHT_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete insight");
    },
  });
};

export const useDashboardInsights = (societyId: string) => {
  return useQuery({
    queryKey: [INSIGHT_KEY, "dashboard", societyId],
    queryFn: async () => {
      const response = await aiApi.getDashboardInsights(societyId);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch dashboard insights"
      );
    },
    enabled: !!societyId,
  });
};
