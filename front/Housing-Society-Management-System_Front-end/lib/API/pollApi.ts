// lib/API/pollApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  Poll,
  PollResults,
  CreatePollDto,
  UpdatePollDto,
  PollQueryParams,
  CastVoteDto,
} from "@/lib/types/poll";

const BASE = "/polls";

export const pollApi = {
  getAll: (params: PollQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.pollType) queryParams.pollType = params.pollType;
    if (params.status) queryParams.status = params.status;

    return apiClient.get<{
      items: Poll[];
      pagination: PaginatedResponse<Poll>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getById: (id: string) => apiClient.get<Poll>(`${BASE}/${id}`),

  create: (data: CreatePollDto) => apiClient.post<Poll>(BASE, data),

  update: (id: string, data: UpdatePollDto) =>
    apiClient.put<Poll>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  castVote: (id: string, data: CastVoteDto) =>
    apiClient.post<Poll>(`${BASE}/${id}/vote`, data),

  getResults: (id: string) =>
    apiClient.get<PollResults>(`${BASE}/${id}/results`),

  closePoll: (id: string) =>
    apiClient.patch<Poll>(`${BASE}/${id}/close`, {}),
};
