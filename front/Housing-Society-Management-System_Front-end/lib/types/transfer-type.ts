// src/lib/types/transfer-type.ts
export interface TransferType {
  _id: string;
  typeName: string;
  description?: string;
  transferFee: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    userName: string;
    fullName?: string;
    designation?: string;
  };
  modifiedBy?: {
    _id: string;
    userName: string;
    fullName?: string;
    designation?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  transferCount?: number;
  formattedFee?: string;
}

export interface CreateTransferTypeDto {
  typeName: string;
  description?: string;
  transferFee: number;
}

export interface UpdateTransferTypeDto {
  typeName?: string;
  description?: string;
  transferFee?: number;
  isActive?: boolean;
}

export interface TransferTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  minFee?: number;
  maxFee?: number;
}

export interface TransferTypeSummary {
  totalTypes: number;
  activeTypes: number;
  totalTransfers: number;
  revenueGenerated: number;
  recentlyAdded: TransferType[];
}

export interface TransferTypeStatistics {
  totalTypes: number;
  activeTypes: number;
  inactiveTypes: number;
  totalTransfers: number;
  totalFeeGenerated: number;
  averageFee: number;
  mostUsedTypes: Array<{
    typeName: string;
    transferCount: number;
    totalFee: number;
  }>;
}

export interface TransferTypeDropdown {
  value: string;
  label: string;
  fee: number;
  formattedFee: string;
}

export interface FeeCalculationResult {
  baseFee: number;
  discountAmount: number;
  totalFee: number;
  breakdown: {
    typeName: string;
    baseTransferFee: number;
    propertyValue?: number;
    discountPercentage?: number;
    calculationMethod: string;
  };
}

export interface CommonTransferType {
  name: string;
  description: string;
  typicalFee: number;
  requiresDocuments: string[];
}
