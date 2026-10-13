// lib/types/subscription.ts
export type SupportLevel = 'email' | 'priority' | 'dedicated';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type SubscriptionAction = 'subscribe' | 'upgrade' | 'downgrade' | 'renew' | 'cancel' | 'expire';

export interface SubscriptionFeatures {
  maxMembers: number;
  maxProjects: number;
  maxStaff: number;
  maxPlots: number;
  modules: string[];
  storageGB: number;
  supportLevel: SupportLevel;
  customBranding: boolean;
  apiAccess: boolean;
  visitorManagement: boolean;
  facilityBooking: boolean;
  advancedReporting: boolean;
}

export interface SubscriptionPackage {
  _id: string;
  packageName: string;
  packageCode: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: SubscriptionFeatures;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdBy: string;
  modifiedBy?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionHistory {
  _id: string;
  societyId: string | { _id: string; societyName: string };
  packageId: string | { _id: string; packageName: string };
  action: SubscriptionAction;
  previousPackageId?: string | { _id: string; packageName: string };
  startDate: string;
  endDate: string;
  amount: number;
  billingCycle: BillingCycle;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  remarks?: string;
  createdBy: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageDto {
  packageName: string;
  packageCode?: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency?: string;
  features?: Partial<SubscriptionFeatures>;
  isPopular?: boolean;
  sortOrder?: number;
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {}

export interface PackageQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface SubscribeDto {
  societyId: string;
  packageId: string;
  billingCycle: BillingCycle;
  paymentReference?: string;
}

export interface CancelSubscriptionDto {
  reason?: string;
}

export interface HistoryQueryParams {
  page?: number;
  limit?: number;
  action?: SubscriptionAction;
  paymentStatus?: PaymentStatus;
  sortBy?: string;
  sortOrder?: string;
}
