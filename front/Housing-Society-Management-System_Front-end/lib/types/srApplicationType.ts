// src/lib/types/srApplicationType.ts
export interface SrApplicationType {
  _id: string;
  applicationName: string;
  applicationDesc?: string;
  applicationFee: number;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

export interface CreateSrApplicationTypeDto {
  applicationName: string;
  applicationDesc?: string;
  applicationFee: number;
}

export interface UpdateSrApplicationTypeDto {
  applicationName?: string;
  applicationDesc?: string;
  applicationFee?: number;
}

export interface SrApplicationTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SrApplicationTypeDropdown {
  _id: string;
  applicationName: string;
  applicationFee: number;
}
