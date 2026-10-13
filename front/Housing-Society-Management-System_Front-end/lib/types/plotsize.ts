// src/lib/types/plotsize.ts
export interface PlotSize {
  _id: string;
  plotSizeName: string;
  totalArea: number;
  areaUnit: string;
  ratePerUnit: number;
  standardBasePrice: number;
  formattedPrice?: string; // Virtual from backend
  formattedRate?: string; // Virtual from backend
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

export interface CreatePlotSizeDto {
  plotSizeName: string;
  totalArea: number;
  areaUnit: string;
  ratePerUnit: number;
  standardBasePrice?: number;
}

export type UpdatePlotSizeDto = Partial<CreatePlotSizeDto>;

export interface PlotSizeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  areaUnit?: string;
  minArea?: number;
  maxArea?: number;
  projectId?: string;
}

export interface PriceCalculationDto {
  totalArea: number;
  areaUnit: string;
  ratePerUnit: number;
}

export interface AreaConversionDto {
  value: number;
  fromUnit: string;
  toUnit: string;
}

export interface PlotSizeSummary {
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  totalSizes: number;
}

export interface PlotSizeStatistics {
  _id: string; // areaUnit
  count: number;
  minArea: number;
  maxArea: number;
  avgArea: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalArea: number;
  totalValue: number;
}

export interface PriceBreakdown {
  plotSize: PlotSize;
  breakdown: {
    totalArea: number;
    areaUnit: string;
    ratePerUnit: number;
    totalPrice: number;
    calculation: string;
  };
}
