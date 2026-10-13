// lib/API/gamificationApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  GamificationPoints,
  PointHistoryEntry,
  GamificationReward,
  GamificationRedemption,
  LeaderboardEntry,
  RedeemDto,
  AwardPointsDto,
  CreateRewardDto,
  UpdateRewardDto,
  LeaderboardQueryParams,
} from "@/lib/types/gamification";

const BASE = "/gamification";

export const gamificationApi = {
  // Points
  getPoints: (memberId?: string) => {
    const url = memberId
      ? `${BASE}/points/${memberId}`
      : `${BASE}/points`;
    return apiClient.get<GamificationPoints>(url);
  },

  getHistory: (
    memberId?: string,
    params: { page?: number; limit?: number } = {}
  ) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    const url = memberId
      ? `${BASE}/points/${memberId}/history`
      : `${BASE}/points/history`;

    return apiClient.get<{
      history: PointHistoryEntry[];
      pagination: PaginatedResponse<PointHistoryEntry>["pagination"];
    }>(url, { params: queryParams });
  },

  getLeaderboard: (params: LeaderboardQueryParams) => {
    const queryParams: Record<string, unknown> = {
      societyId: params.societyId,
    };
    if (params.period) queryParams.period = params.period;
    if (params.limit) queryParams.limit = params.limit;

    return apiClient.get<LeaderboardEntry[]>(`${BASE}/leaderboard`, {
      params: queryParams,
    });
  },

  awardPoints: (data: AwardPointsDto) =>
    apiClient.post<GamificationPoints>(`${BASE}/points/award`, data),

  // Rewards
  getRewards: (
    societyId: string,
    params: { page?: number; limit?: number } = {}
  ) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      societyId,
    };

    return apiClient.get<{
      rewards: GamificationReward[];
      pagination: PaginatedResponse<GamificationReward>["pagination"];
    }>(`${BASE}/rewards`, { params: queryParams });
  },

  createReward: (data: CreateRewardDto) =>
    apiClient.post<GamificationReward>(`${BASE}/rewards`, data),

  updateReward: (id: string, data: UpdateRewardDto) =>
    apiClient.put<GamificationReward>(`${BASE}/rewards/${id}`, data),

  deleteReward: (id: string) =>
    apiClient.delete(`${BASE}/rewards/${id}`),

  // Redemptions
  redeem: (data: RedeemDto) =>
    apiClient.post<GamificationRedemption>(`${BASE}/redeem`, data),

  getRedemptions: (params: { page?: number; limit?: number; societyId?: string; memberId?: string; status?: string } = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.memberId) queryParams.memberId = params.memberId;
    if (params.status) queryParams.status = params.status;

    return apiClient.get<{
      redemptions: GamificationRedemption[];
      pagination: PaginatedResponse<GamificationRedemption>["pagination"];
    }>(`${BASE}/redemptions`, { params: queryParams });
  },

  approveRedemption: (id: string) =>
    apiClient.patch<GamificationRedemption>(
      `${BASE}/redemptions/${id}/approve`
    ),

  rejectRedemption: (id: string, data: { remarks?: string } = {}) =>
    apiClient.patch<GamificationRedemption>(
      `${BASE}/redemptions/${id}/reject`,
      data
    ),

  fulfillRedemption: (id: string) =>
    apiClient.patch<GamificationRedemption>(
      `${BASE}/redemptions/${id}/fulfill`
    ),
};
