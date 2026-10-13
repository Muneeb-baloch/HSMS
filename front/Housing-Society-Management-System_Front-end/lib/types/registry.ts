// src/lib/types/registry.ts
export type VerificationStatus = "Pending" | "Verified" | "Rejected";

export interface Registry {
  _id: string;
  plotId:
    | string
    | {
        _id: string;
        plotNo?: string;
        plotArea?: number;
        plotDimensions?: string;
        plotBlockId?: { _id: string; plotBlockName: string };
        projectId?: { _id: string; projName: string; projCode?: string };
      };
  memId: string | { _id: string; memName?: string; memNic?: string };
  registryNo: string;
  mozaVillage?: string;
  khasraNo?: string;
  khewatNo?: string;
  khatoniNo?: string;
  mutationNo: string;
  mutationDate?: Date | string;
  areaKanal?: number;
  areaMarla?: number;
  areaSqft?: number;
  mutationArea?: string;
  legalOfficeDetails?: string;
  subRegistrarName?: string;
  agreementDate?: Date | string;
  stampPaperNo?: string;
  tabadlaNama?: string;
  bookNo?: string;
  volumeNo?: string;
  documentNo?: string;
  reportNo?: string;
  scanCopyPath?: string;
  landOwnerPhoto?: string;
  remarks?: string;
  verificationStatus: VerificationStatus;
  verificationRemarks?: string;
  verifiedBy?: string | { _id: string; fullName?: string };
  verifiedAt?: Date | string;
  isActive: boolean;
  registeredBy?: string | { _id: string; fullName?: string; userName?: string };
  updatedBy?: string | { _id: string; fullName?: string };
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeleted?: boolean;
  totalArea?: string;
}

export interface CreateRegistryDto {
  plotId: string;
  memId: string;
  registryNo: string;
  mozaVillage?: string;
  khasraNo?: string;
  khewatNo?: string;
  khatoniNo?: string;
  mutationNo: string;
  mutationDate?: string | Date;
  areaKanal?: number;
  areaMarla?: number;
  areaSqft?: number;
  mutationArea?: string;
  legalOfficeDetails?: string;
  subRegistrarName?: string;
  agreementDate?: string | Date;
  stampPaperNo?: string;
  tabadlaNama?: string;
  bookNo?: string;
  volumeNo?: string;
  documentNo?: string;
  reportNo?: string;
  scanCopyPath?: string;
  landOwnerPhoto?: string;
  remarks?: string;
}

export interface UpdateRegistryDto {
  plotId?: string;
  memId?: string;
  registryNo?: string;
  mozaVillage?: string;
  khasraNo?: string;
  khewatNo?: string;
  khatoniNo?: string;
  mutationNo?: string;
  mutationDate?: string | Date;
  areaKanal?: number;
  areaMarla?: number;
  areaSqft?: number;
  mutationArea?: string;
  legalOfficeDetails?: string;
  subRegistrarName?: string;
  agreementDate?: string | Date;
  stampPaperNo?: string;
  tabadlaNama?: string;
  bookNo?: string;
  volumeNo?: string;
  documentNo?: string;
  reportNo?: string;
  scanCopyPath?: string;
  landOwnerPhoto?: string;
  remarks?: string;
  verificationStatus?: VerificationStatus;
  verificationRemarks?: string;
}

export interface RegistryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  plotId?: string;
  memId?: string;
  registryNo?: string;
  mutationNo?: string;
  mozaVillage?: string;
  khasraNo?: string;
  khewatNo?: string;
  khatoniNo?: string;
  subRegistrarName?: string;
  year?: number;
  verificationStatus?: VerificationStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RegistrySearchParams {
  searchTerm?: string;
  registryNo?: string;
  mutationNo?: string;
  memId?: string;
  plotId?: string;
  mozaVillage?: string;
  khasraNo?: string;
  khewatNo?: string;
  khatoniNo?: string;
  limit?: number;
}

export interface VerifyRegistryDto {
  verificationStatus: "Verified" | "Rejected";
  verificationRemarks?: string;
}
