// src/lib/types/plottypes.ts
export interface PlotTypes {
  _id: string;
  plotTypeName: string;
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

export interface CreatePlotTypeDto {
  plotTypeName: string;
}

export type UpdatePlotTypeDto = Partial<CreatePlotTypeDto>;

export interface PlotTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
