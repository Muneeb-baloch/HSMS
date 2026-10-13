export type BillTypeCategory =
  | "Utility"
  | "Administrative"
  | "Penalty"
  | "Tax"
  | "Fee"
  | "Other";

export type BillTypeFrequency =
  | "MONTHLY"
  | "QUARTERLY"
  | "BIANNUALLY"
  | "ANNUALLY"
  | "ONE_TIME";

export type BillTypeCalculationMethod =
  | "FIXED"
  | "PER_UNIT"
  | "PERCENTAGE"
  | "TIERED";

export interface BillType {
  _id: string;
  billTypeName: string;
  billTypeCategory: BillTypeCategory;
  description?: string;
  isRecurring: boolean;
  defaultAmount?: number;
  frequency?: BillTypeFrequency;
  calculationMethod?: BillTypeCalculationMethod;
  unitType?: string;
  ratePerUnit?: number;
  taxRate?: number;
  isTaxable: boolean;
  isActive: boolean;
  createdBy?: string | { _id: string; fullName?: string; userName?: string };
  modifiedBy?: string | { _id: string; fullName?: string };
  isDeleted?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  billCount?: number;
}

export interface CreateBillTypeDto {
  billTypeName: string;
  billTypeCategory: BillTypeCategory;
  description?: string;
  isRecurring: boolean;
  defaultAmount?: number;
  frequency?: BillTypeFrequency;
  calculationMethod?: BillTypeCalculationMethod;
  unitType?: string;
  ratePerUnit?: number;
  taxRate?: number;
  isTaxable?: boolean;
}

export interface UpdateBillTypeDto {
  billTypeName?: string;
  billTypeCategory?: BillTypeCategory;
  description?: string;
  isRecurring?: boolean;
  defaultAmount?: number;
  frequency?: BillTypeFrequency;
  calculationMethod?: BillTypeCalculationMethod;
  unitType?: string;
  ratePerUnit?: number;
  taxRate?: number;
  isTaxable?: boolean;
  isActive?: boolean;
}

export interface BillTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: BillTypeCategory;
  isRecurring?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BillTypeStatistics {
  totalBillTypes: number;
  byCategory: Record<string, number>;
  recurringCount: number;
  nonRecurringCount: number;
  activeCount: number;
  inactiveCount: number;
  mostUsedTypes: Array<{
    billTypeName: string;
    billCount: number;
    category: string;
  }>;
}

export interface CalculateAmountResult {
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  breakdown: Record<string, unknown>;
}

export interface ValidateConfigurationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}
