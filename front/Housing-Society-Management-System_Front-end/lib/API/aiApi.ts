// lib/API/aiApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  AIConversation,
  AIInsight,
  ChatDto,
  ChatResponse,
  AIQueryParams,
  InsightQueryParams,
} from "@/lib/types/ai";

const BASE = "/ai";

export const aiApi = {
  // Chat
  chat: (data: ChatDto) =>
    apiClient.post<ChatResponse>(`${BASE}/chat`, data),

  // Conversations
  getConversations: (params: AIQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.agentType) queryParams.agentType = params.agentType;
    if (params.status) queryParams.status = params.status;

    return apiClient.get<{
      conversations: AIConversation[];
      pagination: PaginatedResponse<AIConversation>["pagination"];
    }>(`${BASE}/conversations`, { params: queryParams });
  },

  getConversation: (id: string) =>
    apiClient.get<AIConversation>(`${BASE}/conversations/${id}`),

  deleteConversation: (id: string) =>
    apiClient.delete(`${BASE}/conversations/${id}`),

  archiveConversation: (id: string) =>
    apiClient.patch<AIConversation>(
      `${BASE}/conversations/${id}/archive`
    ),

  // Insights
  getInsights: (params: InsightQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.insightType) queryParams.insightType = params.insightType;
    if (params.category) queryParams.category = params.category;
    if (params.severity) queryParams.severity = params.severity;

    return apiClient.get<{
      insights: AIInsight[];
      pagination: PaginatedResponse<AIInsight>["pagination"];
    }>(`${BASE}/insights`, { params: queryParams });
  },

  createInsight: (data: Omit<AIInsight, "_id" | "createdAt">) =>
    apiClient.post<AIInsight>(`${BASE}/insights`, data),

  acknowledgeInsight: (id: string) =>
    apiClient.patch<AIInsight>(`${BASE}/insights/${id}/acknowledge`),

  deleteInsight: (id: string) =>
    apiClient.delete(`${BASE}/insights/${id}`),

  getDashboardInsights: (societyId: string) =>
    apiClient.get<AIInsight[]>(
      `${BASE}/insights/dashboard/${societyId}`
    ),
};
