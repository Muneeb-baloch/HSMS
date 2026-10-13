// lib/hooks/entities/useGamification.ts
import { gamificationApi } from "@/lib/API/gamificationApi";
import {
  GamificationPoints,
  GamificationReward,
  GamificationRedemption,
  AwardPointsDto,
  CreateRewardDto,
  UpdateRewardDto,
  RedeemDto,
  LeaderboardQueryParams,
} from "@/lib/types/gamification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const POINTS_KEY = "gamification-points";
const REWARD_KEY = "gamification-rewards";
const REDEMPTION_KEY = "gamification-redemptions";
const LEADERBOARD_KEY = "gamification-leaderboard";

// ── Points ────────────────────────────────────────────────────

export const usePoints = (memberId?: string) => {
  return useQuery({
    queryKey: [POINTS_KEY, memberId],
    queryFn: async () => {
      const response = await gamificationApi.getPoints(memberId);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch points"
      );
    },
  });
};

export const usePointHistory = (
  memberId?: string,
  params: { page?: number; limit?: number } = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [POINTS_KEY, "history", memberId, queryKeyString],
    queryFn: async () => {
      const response = await gamificationApi.getHistory(memberId, params);
      if (response.data.success) {
        return {
          items: response.data.data.history,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch point history"
      );
    },
  });
};

export const useLeaderboard = (params: LeaderboardQueryParams) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [LEADERBOARD_KEY, queryKeyString],
    queryFn: async () => {
      const response = await gamificationApi.getLeaderboard(params);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch leaderboard"
      );
    },
    enabled: !!params.societyId,
  });
};

export const useAwardPoints = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: AwardPointsDto
    ): Promise<GamificationPoints> => {
      const response = await gamificationApi.awardPoints(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to award points"
      );
    },
    onSuccess: () => {
      customToast.success("Points awarded successfully");
      queryClient.invalidateQueries({ queryKey: [POINTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [LEADERBOARD_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to award points");
    },
  });
};

// ── Rewards ───────────────────────────────────────────────────

export const useRewards = (
  societyId: string,
  params: { page?: number; limit?: number } = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [REWARD_KEY, societyId, queryKeyString],
    queryFn: async () => {
      const response = await gamificationApi.getRewards(societyId, params);
      if (response.data.success) {
        return {
          items: response.data.data.rewards,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch rewards"
      );
    },
    enabled: !!societyId,
  });
};

export const useCreateReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: CreateRewardDto
    ): Promise<GamificationReward> => {
      const response = await gamificationApi.createReward(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to create reward"
      );
    },
    onSuccess: () => {
      customToast.success("Reward created successfully");
      queryClient.invalidateQueries({ queryKey: [REWARD_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create reward");
    },
  });
};

export const useUpdateReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRewardDto;
    }): Promise<GamificationReward> => {
      const response = await gamificationApi.updateReward(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to update reward"
      );
    },
    onSuccess: (data) => {
      customToast.success("Reward updated successfully");
      queryClient.invalidateQueries({ queryKey: [REWARD_KEY] });
      queryClient.invalidateQueries({
        queryKey: [REWARD_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update reward");
    },
  });
};

export const useDeleteReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await gamificationApi.deleteReward(id);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete reward"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Reward deleted successfully");
      queryClient.invalidateQueries({ queryKey: [REWARD_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete reward");
    },
  });
};

// ── Redemptions ───────────────────────────────────────────────

export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: RedeemDto
    ): Promise<GamificationRedemption> => {
      const response = await gamificationApi.redeem(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to redeem reward"
      );
    },
    onSuccess: () => {
      customToast.success("Reward redeemed successfully");
      queryClient.invalidateQueries({ queryKey: [POINTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [REDEMPTION_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to redeem reward");
    },
  });
};

export const useRedemptions = (
  params: {
    page?: number;
    limit?: number;
    societyId?: string;
    memberId?: string;
    status?: string;
  } = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [REDEMPTION_KEY, queryKeyString],
    queryFn: async () => {
      const response = await gamificationApi.getRedemptions(params);
      if (response.data.success) {
        return {
          items: response.data.data.redemptions,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch redemptions"
      );
    },
  });
};

export const useApproveRedemption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<GamificationRedemption> => {
      const response = await gamificationApi.approveRedemption(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to approve redemption"
      );
    },
    onSuccess: (data) => {
      customToast.success("Redemption approved");
      queryClient.invalidateQueries({ queryKey: [REDEMPTION_KEY] });
      queryClient.invalidateQueries({
        queryKey: [REDEMPTION_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to approve redemption");
    },
  });
};

export const useRejectRedemption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data?: { remarks?: string };
    }): Promise<GamificationRedemption> => {
      const response = await gamificationApi.rejectRedemption(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to reject redemption"
      );
    },
    onSuccess: (data) => {
      customToast.success("Redemption rejected");
      queryClient.invalidateQueries({ queryKey: [REDEMPTION_KEY] });
      queryClient.invalidateQueries({
        queryKey: [REDEMPTION_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to reject redemption");
    },
  });
};

export const useFulfillRedemption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<GamificationRedemption> => {
      const response = await gamificationApi.fulfillRedemption(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fulfill redemption"
      );
    },
    onSuccess: (data) => {
      customToast.success("Redemption fulfilled");
      queryClient.invalidateQueries({ queryKey: [REDEMPTION_KEY] });
      queryClient.invalidateQueries({
        queryKey: [REDEMPTION_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to fulfill redemption");
    },
  });
};
