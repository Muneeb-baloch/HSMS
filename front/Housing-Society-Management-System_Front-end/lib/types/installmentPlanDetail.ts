export interface InstallmentPlanDetail {
  _id: string;
  planId: string | { _id: string; planName: string; projId?: any };
  instCatId: string | { _id: string; instCatName: string; instCatDescription?: string };
  occurrence: number;
  percentageAmount: number;
  fixedAmount: number;
  createdBy?: { _id: string; userName: string; fullName: string };
  updatedBy?: { _id: string; userName: string; fullName: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInstallmentPlanDetailDto {
  planId: string;
  instCatId: string;
  occurrence: number;
  percentageAmount?: number;
  fixedAmount?: number;
}

export interface BulkCreateInstallmentPlanDetailDto {
  planId: string;
  details: Array<{
    instCatId: string;
    occurrence: number;
    percentageAmount?: number;
    fixedAmount?: number;
  }>;
}

export interface UpdateInstallmentPlanDetailDto {
  occurrence?: number;
  percentageAmount?: number;
  fixedAmount?: number;
}

export interface InstallmentPlanDetailQueryParams {
  page?: number;
  limit?: number;
  planId?: string;
  instCatId?: string;
  occurrence?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InstallmentPlanDetailSummary {
  totalDetails: number;
  totalPercentageSum: number;
  totalFixedSum: number;
  byPlan: Array<{
    planId: string;
    planName: string;
    count: number;
    totalPercentage: number;
    totalFixed: number;
  }>;
}
