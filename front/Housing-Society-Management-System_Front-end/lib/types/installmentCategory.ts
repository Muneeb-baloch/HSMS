// src/lib/types/installmentCategory.ts
export interface InstallmentCategory {
  _id: string;
  id?: string; // Frontend compatibility
  instCatName: string;
  instCatDescription?: string;
  isRefundable: boolean;
  isMandatory: boolean;
  sequenceOrder: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    userName: string;
    fullName: string;
  };
  modifiedBy?: {
    _id: string;
    userName: string;
    fullName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInstallmentCategoryDto {
  instCatName: string;
  instCatDescription?: string;
  isRefundable?: boolean;
  isMandatory?: boolean;
  sequenceOrder: number;
  isActive?: boolean;
}

export interface UpdateInstallmentCategoryDto {
  instCatName?: string;
  instCatDescription?: string;
  isRefundable?: boolean;
  isMandatory?: boolean;
  sequenceOrder?: number;
  isActive?: boolean;
}

export interface InstallmentCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isRefundable?: boolean;
  isMandatory?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface InstallmentCategorySummary {
  totalCategories: number;
  activeCategories: number;
  mandatoryCategories: number;
  refundableCategories: number;
  categoriesByType: Array<{
    name: string;
    count: number;
    isMandatory: boolean;
    isRefundable: boolean;
  }>;
}

export interface InstallmentCategoryOption {
  id: string;
  name: string;
  description?: string;
  isMandatory: boolean;
  isRefundable: boolean;
  sequenceOrder: number;
}

export interface ReorderCategoryDto {
  categoryOrders: Array<{
    id: string;
    sequenceOrder: number;
  }>;
}
