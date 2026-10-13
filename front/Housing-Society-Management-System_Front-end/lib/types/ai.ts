// lib/types/ai.ts

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AIConversation {
  _id: string;
  userId: string;
  societyId: string;
  agentType:
    | "resident-assistant"
    | "committee-advisor"
    | "financial-analyst"
    | "compliance-monitor";
  title?: string;
  messages: AIMessage[];
  status: "active" | "archived";
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIInsight {
  _id: string;
  societyId: string;
  insightType:
    | "prediction"
    | "anomaly"
    | "recommendation"
    | "trend"
    | "alert";
  category: string;
  title: string;
  description: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  data?: Record<string, unknown>;
  actionable: boolean;
  actionUrl?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChatDto {
  agentType: string;
  message: string;
  conversationId?: string;
  societyId: string;
}

export interface ChatResponse {
  conversationId: string;
  response: string;
  agentType: string;
}

export interface AIQueryParams {
  page?: number;
  limit?: number;
  agentType?: string;
  status?: string;
}

export interface InsightQueryParams {
  page?: number;
  limit?: number;
  insightType?: string;
  category?: string;
  severity?: string;
}
