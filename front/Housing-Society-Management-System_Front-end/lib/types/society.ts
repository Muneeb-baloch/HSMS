// lib/types/society.ts
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'suspended';

export interface SocietySettings {
  currency: string;
  dateFormat: string;
  timezone: string;
  lateFeeEnabled: boolean;
  lateFeeRate: number;
}

export interface Society {
  _id: string;
  societyName: string;
  societyCode: string;
  address: string;
  cityId?: string | { _id: string; cityName: string };
  stateId?: string | { _id: string; stateName: string };
  country: string;
  zipCode?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  logo?: string;
  subscriptionPlanId?: string | { _id: string; packageName: string };
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  trialEndsAt: string;
  maxMembers: number;
  maxProjects: number;
  maxStaff: number;
  enabledModules: string[];
  settings: SocietySettings;
  isActive: boolean;
  createdBy: string | { _id: string; firstName: string; lastName: string };
  modifiedBy?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSocietyDto {
  societyName: string;
  societyCode?: string;
  address?: string;
  cityId?: string;
  stateId?: string;
  country?: string;
  zipCode?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  logo?: string;
  maxMembers?: number;
  maxProjects?: number;
  maxStaff?: number;
  enabledModules?: string[];
  settings?: Partial<SocietySettings>;
}

export interface UpdateSocietyDto extends Partial<CreateSocietyDto> {}

export interface SocietyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subscriptionStatus?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface SocietyStats {
  totalMembers: number;
  totalProjects: number;
  totalPlots: number;
  totalStaff: number;
  subscriptionStatus: SubscriptionStatus;
  limits: {
    maxMembers: number;
    maxProjects: number;
    maxStaff: number;
  };
}
