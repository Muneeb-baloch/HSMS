// src/lib/types/plotcategory.ts
export interface PlotCategory {
  _id: string;
  categoryName: string;
  surchargePercentage?: number;
  surchargeFixedAmount?: number;
  categoryDesc?: string;
  isActive: boolean;
  surchargeType?: "percentage" | "fixed" | "none"; // Virtual from backend
  formattedSurcharge?: string; // Virtual from backend
  createdBy:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  updatedBy?:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}
type surchargeType = "percentage" | "fixed" | "none";
export interface CreatePlotCategoryDto {
  categoryName: string;
  surchargePercentage?: number;
  surchargeFixedAmount?: number;
  surchargeType?: surchargeType;
  categoryDesc?: string;
  isActive?: boolean;
}

export type UpdatePlotCategoryDto = Partial<CreatePlotCategoryDto>;

export interface PlotCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  surchargeType?: "percentage" | "fixed" | "none";
}

export interface PriceCalculationDto {
  basePrice: number;
  surchargeInfo?: SurchargeInfo;
  categoryId: string;
}

export interface BulkPriceCalculationDto {
  basePrice: number;
  calculations?: PriceCalculationDto[];
  categoryIds: string[];
}

export interface SurchargeInfo {
  type: "percentage" | "fixed" | "none";
  value: number;
  formattedValue: string;
  finalPrice: number;
  surchargeAmount: number;
}

export interface PlotCategorySummary {
  total: number;
  activeCount: number;
  inactiveCount: number;
  percentageSurchargeCount: number;
  fixedSurchargeCount: number;
  noSurchargeCount: number;
}

export interface CategoryStatistics {
  totalCategories: number;
  activeCategories: number;
  percentageSurchargeCount: number;
  fixedSurchargeCount: number;
  avgPercentageSurcharge: number;
  avgFixedSurcharge: number;
}
