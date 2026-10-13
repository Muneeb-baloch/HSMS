// lib/API/forumApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  ForumThread,
  ForumReply,
  CreateThreadDto,
  CreateReplyDto,
  ThreadQueryParams,
  ReplyQueryParams,
} from "@/lib/types/forum";

const BASE = "/forum";

export const forumApi = {
  // Threads
  getThreads: (params: ThreadQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.category) queryParams.category = params.category;
    if (params.isPinned !== undefined) queryParams.isPinned = params.isPinned;
    if (params.search) queryParams.search = params.search;
    if (params.sortBy) queryParams.sortBy = params.sortBy;

    return apiClient.get<{
      items: ForumThread[];
      pagination: PaginatedResponse<ForumThread>["pagination"];
    }>(`${BASE}/threads`, { params: queryParams });
  },

  getThreadById: (id: string) =>
    apiClient.get<ForumThread>(`${BASE}/threads/${id}`),

  createThread: (data: CreateThreadDto) =>
    apiClient.post<ForumThread>(`${BASE}/threads`, data),

  updateThread: (id: string, data: Partial<CreateThreadDto>) =>
    apiClient.put<ForumThread>(`${BASE}/threads/${id}`, data),

  deleteThread: (id: string) =>
    apiClient.delete(`${BASE}/threads/${id}`),

  pinThread: (id: string) =>
    apiClient.patch<ForumThread>(`${BASE}/threads/${id}/pin`, {}),

  lockThread: (id: string) =>
    apiClient.patch<ForumThread>(`${BASE}/threads/${id}/lock`, {}),

  likeThread: (id: string) =>
    apiClient.post<ForumThread>(`${BASE}/threads/${id}/like`, {}),

  flagThread: (id: string) =>
    apiClient.post<ForumThread>(`${BASE}/threads/${id}/flag`, {}),

  // Replies
  getReplies: (threadId: string, params: ReplyQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };

    return apiClient.get<{
      items: ForumReply[];
      pagination: PaginatedResponse<ForumReply>["pagination"];
    }>(`${BASE}/threads/${threadId}/replies`, { params: queryParams });
  },

  createReply: (threadId: string, data: CreateReplyDto) =>
    apiClient.post<ForumReply>(`${BASE}/threads/${threadId}/replies`, data),

  updateReply: (replyId: string, data: Partial<CreateReplyDto>) =>
    apiClient.put<ForumReply>(`${BASE}/replies/${replyId}`, data),

  deleteReply: (replyId: string) =>
    apiClient.delete(`${BASE}/replies/${replyId}`),

  likeReply: (replyId: string) =>
    apiClient.post<ForumReply>(`${BASE}/replies/${replyId}/like`, {}),

  flagReply: (replyId: string) =>
    apiClient.post<ForumReply>(`${BASE}/replies/${replyId}/flag`, {}),

  // Stats
  getForumStats: (societyId: string) =>
    apiClient.get<Record<string, unknown>>(`${BASE}/stats/${societyId}`),
};
