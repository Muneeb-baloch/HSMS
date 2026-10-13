// src/lib/types/city.ts
export interface City {
  stateName: any;
  _id: string;
  cityName: string;
  cityDescription?: string;
  stateId:
    | {
        _id: string;
        stateName: string;
      }
    | string;
  statusId?:
    | {
        _id: string;
        statusName: string;
      }
    | string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  isActive?: boolean;
}

export interface CreateCityDto {
  cityName: string;
  cityDescription?: string;
  stateId: string;
  statusId?: string;
}

export type UpdateCityDto = Partial<CreateCityDto>;

export interface CityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
  stateId?: string;
  statusId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
