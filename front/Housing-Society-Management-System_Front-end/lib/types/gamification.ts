// lib/types/gamification.ts

export interface GamificationPoints {
  _id: string;
  memberId: string;
  societyId: string;
  totalPoints: number;
  currentPoints: number;
  level: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointHistoryEntry {
  event: string;
  points: number;
  date: string;
  description?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface GamificationReward {
  _id: string;
  societyId: string;
  rewardName: string;
  description?: string;
  pointsCost: number;
  quantity: number;
  rewardType:
    | "discount"
    | "free-booking"
    | "merchandise"
    | "recognition"
    | "donation";
  rewardValue?: Record<string, unknown>;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
}

export interface GamificationRedemption {
  _id: string;
  memberId: string;
  societyId: string;
  rewardId: string;
  pointsSpent: number;
  status: "pending" | "approved" | "fulfilled" | "rejected" | "cancelled";
  approvedBy?: string;
  fulfilledAt?: string;
  remarks?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  memberId: string;
  memberName: string;
  totalPoints: number;
  level: string;
  rank: number;
}

export interface RedeemDto {
  rewardId: string;
  societyId: string;
}

export interface AwardPointsDto {
  memberId: string;
  societyId: string;
  event: string;
  points: number;
  description?: string;
}

export interface CreateRewardDto {
  societyId: string;
  rewardName: string;
  description?: string;
  pointsCost: number;
  quantity?: number;
  rewardType: string;
  rewardValue?: Record<string, unknown>;
  validUntil?: string;
}

export interface UpdateRewardDto extends Partial<CreateRewardDto> {}

export interface LeaderboardQueryParams {
  societyId: string;
  period?: "monthly" | "yearly" | "all-time";
  limit?: number;
}
