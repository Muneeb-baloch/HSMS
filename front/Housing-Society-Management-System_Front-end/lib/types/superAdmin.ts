// lib/types/superAdmin.ts

export interface PlatformOverview {
  totalSocieties: number;
  activeSocieties: number;
  trialSocieties: number;
  expiredSocieties: number;
  totalMembers: number;
  totalUsers: number;
  totalPlots: number;
  totalRevenue: number;
  mrr: number;
  storageUsedGB: number;
  subscriptionsByPlan: Record<string, number>;
}

export interface SocietyListItem {
  _id: string;
  societyName: string;
  societyCode: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  subscriptionStatus: string;
  subscriptionPlanId?: {
    _id: string;
    packageName: string;
    packageCode: string;
    monthlyPrice: number;
  };
  isActive: boolean;
  maxMembers: number;
  maxProjects: number;
  enabledModules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SocietyHealth {
  societyId: string;
  societyName: string;
  societyCode: string;
  subscriptionStatus: string;
  subscriptionPlanName: string;
  activeUsers: number;
  totalMembers: number;
  totalPlots: number;
  mrr: number;
  lastActivityAt: string;
  healthScore: number;
}

export interface RevenueReport {
  totalRevenue: number;
  monthlyRevenue: Record<string, number>;
  revenueByPlan: Record<string, number>;
}

export interface CreateSocietyPayload {
  societyName: string;
  societyCode?: string;
  address: string;
  cityId?: string;
  stateId?: string;
  country?: string;
  zipCode?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  subscriptionPlanId: string;
  billingCycle: 'monthly' | 'yearly';
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone?: string;
  adminPassword?: string;
}

export interface SubscriptionPlan {
  _id: string;
  packageName: string;
  packageCode: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: {
    maxMembers: number;
    maxProjects: number;
    maxStaff: number;
    maxPlots: number;
    modules: string[];
    storageGB: number;
    supportLevel: 'email' | 'priority' | 'dedicated';
    customBranding: boolean;
    apiAccess: boolean;
    visitorManagement: boolean;
    facilityBooking: boolean;
    advancedReporting: boolean;
  };
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ImpersonatePayload {
  targetUserId: string;
  reason: string;
}

export interface ImpersonateResult {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    societyId?: string;
  };
  expiresIn: string;
  warning: string;
}

export interface SuperAdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subscriptionStatus?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GlobalUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLogin?: string;
  metadata?: { societyId?: string };
  createdAt: string;
}
