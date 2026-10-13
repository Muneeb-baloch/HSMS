// src/lib/types/plotblock.ts
export interface PlotBlock {
  _id: string;
  projectId: string | { _id: string; projName: string; projCode?: string }; // Added
  plotBlockName: string;
  plotBlockDesc?: string;
  blockTotalArea?: number; // Added
  blockAreaUnit?: string; // Added
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

export interface CreatePlotBlockDto {
  projectId: string; // Added - required
  plotBlockName: string;
  plotBlockDesc?: string;
  blockTotalArea?: number; // Added
  blockAreaUnit?: string; // Added
}

export type UpdatePlotBlockDto = Partial<Omit<CreatePlotBlockDto, "projectId">>; // projectId shouldn't be updated

export interface PlotBlockQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  projectId?: string; // Added for filtering
}
