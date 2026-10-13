// src/lib/types/installmentPlan.ts
export interface InstallmentPlan {
  _id: string;
  id?: string;
  projId: string | { _id: string; projName: string; projCode?: string };
  planName: string;
  totalMonths: number;
  totalAmount: number;
  isActive: boolean;
  createdBy?: { _id: string; userName: string; fullName: string };
  updatedBy?: { _id: string; userName: string; fullName: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInstallmentPlanDto {
  projId: string;
  planName: string;
  totalMonths: number;
  totalAmount: number;
  isActive?: boolean;
}

export interface UpdateInstallmentPlanDto {
  planName?: string;
  totalMonths?: number;
  totalAmount?: number;
  isActive?: boolean;
}

export interface InstallmentPlanQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InstallmentPlanDashboardSummary {
  totalPlans: number;
  activePlans: number;
  inactivePlans: number;
  avgTotalMonths: number;
  totalAmountAllPlans: number;
}
