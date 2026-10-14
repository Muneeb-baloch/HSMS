// src/lib/types/installmentCategory.ts

// Mirrors the backend's InstallmentCategoryKind enum. Deterministic
// classification used for down-payment detection and contractPrice
// reconciliation — down_payment/installment count toward it, everything
// else is a real charge tracked on the ledger but excluded from it.
export enum InstallmentCategoryKind {
  DOWN_PAYMENT = "down_payment",
  INSTALLMENT = "installment",
  POSSESSION_FEE = "possession_fee",
  LEGAL_FEE = "legal_fee",
  APPLICATION_FEE = "application_fee",
  NOC_FEE = "noc_fee",
  REGISTRY_FEE = "registry_fee",
  OTHER = "other",
}

export const INSTALLMENT_CATEGORY_KIND_LABELS: Record<
  InstallmentCategoryKind,
  string
> = {
  [InstallmentCategoryKind.DOWN_PAYMENT]: "Down Payment",
  [InstallmentCategoryKind.INSTALLMENT]: "Installment",
  [InstallmentCategoryKind.POSSESSION_FEE]: "Possession Fee",
  [InstallmentCategoryKind.LEGAL_FEE]: "Legal Fee",
  [InstallmentCategoryKind.APPLICATION_FEE]: "Application Fee",
  [InstallmentCategoryKind.NOC_FEE]: "NOC Fee",
  [InstallmentCategoryKind.REGISTRY_FEE]: "Registry Fee",
  [InstallmentCategoryKind.OTHER]: "Other",
};

export interface InstallmentCategory {
  _id: string;
  id?: string; // Frontend compatibility
  instCatName: string;
  instCatDescription?: string;
  kind: InstallmentCategoryKind;
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
  kind: InstallmentCategoryKind;
  isRefundable?: boolean;
  isMandatory?: boolean;
  sequenceOrder: number;
  isActive?: boolean;
}

export interface UpdateInstallmentCategoryDto {
  instCatName?: string;
  instCatDescription?: string;
  kind?: InstallmentCategoryKind;
  isRefundable?: boolean;
  isMandatory?: boolean;
  sequenceOrder?: number;
  isActive?: boolean;
}

export interface InstallmentCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  kind?: InstallmentCategoryKind;
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
