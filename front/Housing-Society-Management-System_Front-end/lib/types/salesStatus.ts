// src/lib/types/salesStatus.ts

export enum SalesStatusType {
  AVAILABLE = "available",
  BOOKED = "booked",
  RESERVED = "reserved",
  ALLOTTED = "allotted",
  CONTRACTED = "contracted",
  CANCELLED = "cancelled",
  ON_HOLD = "on_hold",
  SOLD = "sold",
  PENDING = "pending",
  CLOSED = "closed",
}

export interface SalesStatus {
  _id: string;
  statusName: string;
  statusCode: string;
  statusType: SalesStatusType;
  description?: string;
  colorCode: string;
  isActive: boolean;
  isDefault: boolean;
  sequence: number;
  allowsSale: boolean;
  requiresApproval: boolean;
  notificationTemplate?: string;
  colorName?: string;
  cssClass?: string;
  badgeVariant?: string;
  allowedTransitions?: SalesStatusType[];
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

export interface CreateSalesStatusDto {
  statusName: string;
  statusCode: string;
  statusType: SalesStatusType;
  description?: string;
  colorCode?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sequence?: number;
  allowsSale?: boolean;
  requiresApproval?: boolean;
  notificationTemplate?: string;
}

export interface UpdateSalesStatusDto {
  statusName?: string;
  statusCode?: string;
  statusType?: SalesStatusType;
  description?: string;
  colorCode?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sequence?: number;
  allowsSale?: boolean;
  requiresApproval?: boolean;
  notificationTemplate?: string;
}

export interface SalesStatusQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  statusType?: SalesStatusType[];
  isActive?: boolean;
  allowsSale?: boolean;
  requiresApproval?: boolean;
}

export interface SalesStatusStats {
  totalStatuses: number;
  activeStatuses: number;
  salesAllowedCount: number;
  approvalRequiredCount: number;
  byType: Record<SalesStatusType, { total: number; active: number }>;
}

export interface StatusWorkflow {
  currentStatus: SalesStatus;
  allowedTransitions: SalesStatus[];
  validationRules?: Array<{
    field: string;
    required: boolean;
    message: string;
  }>;
}

export interface WorkflowValidationDto {
  currentStatusId: string;
  targetStatusId: string;
}

export interface BulkStatusUpdateDto {
  statusIds: string[];
  field: "isActive" | "allowsSale" | "requiresApproval";
  value: boolean;
}

export interface StatusOrder {
  id: string;
  sequence: number;
}
export interface SalesStatusStatistics {
  totalStatuses: number;
  activeStatuses: number;
  salesAllowedCount: number;
  approvalRequiredCount: number;
  byType: {
    [key in SalesStatusType]?: {
      total: number;
      active: number;
    };
  };
}
