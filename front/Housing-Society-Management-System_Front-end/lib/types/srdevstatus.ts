// src/lib/types/srdevstatus.ts
export enum DevCategory {
  INFRASTRUCTURE = "infrastructure",
  CONSTRUCTION = "construction",
  LEGAL = "legal",
  PLANNING = "planning",
  SERVICES = "services",
  COMPLETION = "completion",
}

export enum DevPhase {
  PRE_CONSTRUCTION = "pre_construction",
  CONSTRUCTION = "construction",
  POST_CONSTRUCTION = "post_construction",
  COMPLETION = "completion",
}

export interface SrDevStatus {
  _id: string;
  srDevStatName: string;
  srDevStatCode: string;
  devCategory: DevCategory;
  devPhase: DevPhase;
  description?: string;
  sequence: number;
  isActive: boolean;
  isDefault: boolean;
  colorCode: string;
  icon?: string;
  percentageComplete: number;
  requiresDocumentation: boolean;
  allowedTransitions?: string[];
  estimatedDurationDays?: number;
  colorName?: string;
  cssClass?: string;
  badgeVariant?: string;
  phaseDescription?: string;
  progressColor?: string;
  estimatedCompletionText?: string;
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

export interface CreateSrDevStatusDto {
  srDevStatName: string;
  srDevStatCode: string;
  devCategory: DevCategory;
  devPhase: DevPhase;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  colorCode?: string;
  icon?: string;
  requiresDocumentation?: boolean;
  allowedTransitions?: string[];
}

export interface UpdateSrDevStatusDto {
  srDevStatName?: string;
  srDevStatCode?: string;
  devCategory?: DevCategory;
  devPhase?: DevPhase;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  colorCode?: string;
  icon?: string;
  requiresDocumentation?: boolean;
  allowedTransitions?: string[];
}

export interface SrDevStatusQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  devCategory?: DevCategory[];
  devPhase?: DevPhase[];
  isActive?: boolean;
  requiresDocumentation?: boolean;
}

export interface StatusOrder {
  id: string;
  sequence: number;
}

export interface StatusTransitionDto {
  currentStatusId: string;
  targetStatusId: string;
  projectId?: string;
  remarks?: string;
  documents?: string[];
}

export interface BulkStatusUpdateDto {
  statusIds: string[];
  field: "isActive" | "requiresDocumentation";
  value: boolean;
}

export interface ProgressReport {
  currentStatus: SrDevStatus;
  nextStatuses: SrDevStatus[];
  overallProgress: number;
  timeline: Array<{
    status: SrDevStatus;
    startDate: Date;
    endDate?: Date;
    actualEndDate?: Date;
    isCompleted: boolean;
    durationDays: number;
  }>;
}
