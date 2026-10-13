// src/lib/types/nominee.ts
export enum RelationType {
  SON = "Son",
  DAUGHTER = "Daughter",
  WIFE = "Wife",
  HUSBAND = "Husband",
  FATHER = "Father",
  MOTHER = "Mother",
  BROTHER = "Brother",
  SISTER = "Sister",
  UNCLE = "Uncle",
  AUNT = "Aunt",
  GRANDFATHER = "Grandfather",
  GRANDMOTHER = "Grandmother",
  OTHER = "Other",
}

export interface Nominee {
  _id: string;
  memId:
    | string
    | { _id: string; memName: string; memNic: string; mobileNo?: string };
  nomineeName: string;
  nomineeCNIC: string;
  relationWithMember: RelationType;
  nomineeContact: string;
  nomineeEmail?: string;
  nomineeAddress?: string;
  nomineeSharePercentage: number;
  nomineePhoto?: string;
  isActive: boolean;
  createdBy?: {
    _id: string;
    userName: string;
    fullName: string;
    designation?: string;
  };
  modifiedBy?: {
    _id: string;
    userName: string;
    fullName: string;
    designation?: string;
  };
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  member?: any;
  relationBadgeColor?: string;
}

export interface CreateNomineeDto {
  memId: string;
  nomineeName: string;
  nomineeCNIC: string;
  relationWithMember: RelationType;
  nomineeContact: string;
  nomineeEmail?: string;
  nomineeAddress?: string;
  nomineeSharePercentage?: number;
  nomineePhoto?: string;
}

export interface UpdateNomineeDto {
  nomineeName?: string;
  nomineeCNIC?: string;
  relationWithMember?: RelationType;
  nomineeContact?: string;
  nomineeEmail?: string;
  nomineeAddress?: string;
  nomineeSharePercentage?: number;
  nomineePhoto?: string;
  isActive?: boolean;
}

export interface NomineeQueryParams {
  page?: number;
  limit?: number;
  memId?: string;
  search?: string;
  relationWithMember?: RelationType;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface NomineeStatistics {
  totalNominees: number;
  activeNominees: number;
  inactiveNominees: number;
  byRelation: Record<string, number>;
  averageSharePercentage: number;
  membersWithMultipleNominees: number;
  topRelations: Array<{
    relation: string;
    count: number;
    averageShare: number;
  }>;
}

export interface NomineeSummary {
  totalNominees: number;
  primaryNominees: number;
  totalShareCoverage: number;
  recentlyAdded: Nominee[];
}

export interface ShareDistribution {
  memberId: string;
  memberName: string;
  totalNominees: number;
  totalSharePercentage: number;
  nominees: Array<{
    name: string;
    relation: string;

    share: number;
  }>;
}
