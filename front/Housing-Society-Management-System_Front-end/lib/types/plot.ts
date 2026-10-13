// src/lib/types/plot.ts

export enum PlotType {
  RESIDENTIAL = "residential",
  COMMERCIAL = "commercial",
  INDUSTRIAL = "industrial",
  AGRICULTURAL = "agricultural",
  CORNER = "corner",
  PARK_FACING = "park_facing",
  MAIN_BOULEVARD = "main_boulevard",
  STANDARD = "standard",
}

export interface Plot {
  _id: string;
  projectId: string | { _id: string; projName: string; projCode?: string };
  plotNo: string;
  plotBlockId:
    | string
    | { _id: string; plotBlockName: string; plotBlockDesc?: string };
  plotSizeId:
    | string
    | {
        _id: string;
        plotSizeName: string;
        totalArea: number;
        areaUnit: string;
      };
  plotType: PlotType;
  plotCategoryId: string | { _id: string; categoryName: string };
  plotStreet?: string;
  plotLength: number;
  plotWidth: number;
  plotArea: number;
  plotAreaUnit: string;
  srDevStatId?:
    | string
    | { _id: string; srDevStatName: string; devPhase?: string };
  salesStatusId:
    | string
    | {
        _id: string;
        statusName: string;
        statusCode: string;
        colorCode?: string;
      };
  surchargeAmount: number;
  fileId?:
    | string
    | {
        _id: string;
        fileNumber: string;
        customerName: string;
        customerCnic?: string;
      };
  plotBasePrice: number;
  plotTotalAmount: number;
  discountAmount: number;
  discountDate?: Date;
  isPossessionReady: boolean;
  plotRegistrationNo?: string;
  plotDimensions?: string;
  plotRemarks?: string;
  plotLatitude?: number;
  plotLongitude?: number;
  plotBoundaryPoints?: Array<{ lat: number; lng: number }>;
  plotDocuments?: Array<{
    documentType: string;
    documentPath: string;
    uploadedDate: Date;
    updatedBy?:
      | {
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
        }
      | string;
  }>;
  createdBy:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  createdAt: Date;
  updatedBy?:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  // Virtual fields
  plotNetPrice?: number;
  pricePerUnit?: number;
  discountPercentage?: number;
  formattedTotalAmount?: string;
  formattedArea?: string;
  dimensionsWithUnit?: string;
  locationDescription?: string;
  nextActions?: string[];
  isAvailable?: boolean;
}

export interface CreatePlotDto {
  projectId: string;
  plotNo: string;
  plotBlockId: string;
  plotSizeId: string;
  plotType: PlotType;
  plotCategoryId: string;
  plotStreet?: string;
  plotLength: number;
  plotWidth: number;
  plotAreaUnit?: string;
  srDevStatId?: string;
  salesStatusId: string;
  surchargeAmount?: number;
  plotBasePrice: number;
  plotTotalAmount?: number;
  discountAmount?: number;
  discountDate?: Date;
  plotRemarks?: string;
  plotLatitude?: number;
  plotLongitude?: number;
  plotBoundaryPoints?: Array<{ lat: number; lng: number }>;
}

export interface UpdatePlotDto extends Partial<CreatePlotDto> {
  isPossessionReady?: boolean;
  fileId?: string;
}

export interface PlotQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  projectId?: string;
  plotBlockId?: string;
  plotType?: PlotType[];
  salesStatusId?: string[];
  srDevStatId?: string[];
  plotCategoryId?: string[];
  isAvailable?: boolean;
  isPossessionReady?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  hasFile?: boolean;
}

export interface PlotAssignmentDto {
  plotId: string;
  fileId: string;
  salesStatusId: string;
  assignedBy: string;
  remarks?: string;
}

export interface BulkPlotUpdateDto {
  plotIds: string[];
  field:
    | "salesStatusId"
    | "srDevStatId"
    | "isPossessionReady"
    | "plotCategoryId";
  value: any;
}

export interface PlotPriceCalculationDto {
  plotSizeId: string;
  plotCategoryId: string;
  plotType: PlotType;
  plotLength: number;
  plotWidth: number;
  discountAmount?: number;
}

export interface PlotFilterOptions {
  projectId?: string;
  blockId?: string;
  type?: PlotType[];
  category?: string[];
  status?: string[];
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  availability?: "available" | "sold" | "all";
}

export interface PlotStatistics {
  total: number;
  available: number;
  sold: number;
  reserved: number;
  byType: Record<PlotType, number>;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  totalArea: number;
  totalValue: number;
  averagePrice: number;
}
