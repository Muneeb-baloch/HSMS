// src/lib/types/state.ts
export interface State {
  _id: string;
  stateName: string;
  stateDescription?: string;
  statusId?:
    | {
        _id: string;
        statusName: string;
      }
    | string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  cityCount?: number;
}

export interface CreateStateDto {
  stateName: string;
  stateDescription?: string;
  statusId?: string;
}

export type UpdateStateDto = Partial<CreateStateDto>;

export interface StateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  statusId?: string;
  searchFields?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
