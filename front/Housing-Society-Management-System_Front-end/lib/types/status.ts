// src/lib/types/status.ts
export interface Status {
  _id: string;
  statusName: string;
  statusDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

export interface CreateStatusDto {
  statusName: string;
  statusDescription?: string;
}

export type UpdateStatusDto = Partial<CreateStatusDto>;

export interface StatusQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
