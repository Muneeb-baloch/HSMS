// lib/types/privacy.ts

export interface PrivacySettings {
  _id: string;
  memberId: string;
  userId: string;
  societyId: string;
  profileVisibility: "everyone" | "committee-only" | "hidden";
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  directoryOptOut: boolean;
  allowAnonymousComplaints: boolean;
  thirdPartySharing: boolean;
  showOnLeaderboard: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    digest: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
  };
  dataRetentionConsent: boolean;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePrivacySettingsDto
  extends Partial<
    Omit<
      PrivacySettings,
      "_id" | "memberId" | "userId" | "societyId" | "createdAt" | "updatedAt"
    >
  > {}

export interface PrivacyAccessLog {
  _id: string;
  memberId: string;
  accessorId: string;
  accessorRole: string;
  accessType: string;
  fieldsAccessed: string[];
  ipAddress: string;
  timestamp: string;
}

export interface PrivacyScore {
  score: number;
  factors: Record<string, number>;
}
