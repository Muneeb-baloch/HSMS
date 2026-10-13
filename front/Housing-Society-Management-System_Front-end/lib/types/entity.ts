import { QueryParams } from "./api";

// src/types/entity.ts
export type Gender = "male" | "female" | "other";
export type MemFHRelation = "father" | "husband" | "guardian";

export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  isDeleted: boolean;
}

export interface Member extends BaseEntity {
  memName: string;
  statusId?:
    | {
        _id: string;
        statusName: string;
      }
    | string;
  memNic: string;
  memImg?: string;
  memCnicFront?: string;
  memCnicBack?: string;
  memFHName?: string;
  memFHRelation?: MemFHRelation;
  memAddr1: string;
  memAddr2?: string;
  memAddr3?: string;
  cityId?:
    | {
        _id: string;
        cityName: string;
      }
    | string;
  memZipPost?: string;
  memContRes?: string;
  memContWork?: string;
  memContMob: string;
  memContEmail?: string;
  memIsOverseas: boolean;
  memPermAdd?: string;
  memRemarks?: string;
  memRegNo?: string;
  dateOfBirth?: Date;
  memOccupation?: string;
  memState?: string;
  memCountry?: string;
  memPermAddress1?: string;
  memPermCity?: string;
  memPermState?: string;
  memPermCountry?: string;
  gender?: Gender;
  deletedAt?: Date;
}

export interface CreateMemberDto {
  memName: string;
  statusId?: string;
  memNic: string;
  memImg?: string;
  memCnicFront?: string;
  memCnicBack?: string;
  memFHName?: string;
  memFHRelation?: MemFHRelation;
  memAddr1: string;
  memAddr2?: string;
  memAddr3?: string;
  cityId?: string;
  societyId?: string;
  memZipPost?: string;
  memContRes?: string;
  memContWork?: string;
  memContMob: string;
  memContEmail?: string;
  memIsOverseas?: boolean;
  memPermAdd?: string;
  memRemarks?: string;
  memRegNo?: string;
  dateOfBirth?: string;
  memOccupation?: string;
  memState?: string;
  memCountry?: string;
  memPermAddress1?: string;
  memPermCity?: string;
  memPermState?: string;
  memPermCountry?: string;
  gender?: Gender;
}

export type UpdateMemberDto = Partial<CreateMemberDto>;

export interface MemberQueryParams extends QueryParams {
  statusId?: string;
  cityId?: string;
  societyId?: string;
  memIsOverseas?: boolean;
  gender?: Gender;
}

export interface City {
  _id: string;
  cityName: string;
  country: string;
  isActive: boolean;
}

export interface MemberStatus {
  _id: string;
  statusName: string;
  description?: string;
  isActive: boolean;
}
