// src/lib/types/srComplaintCategory.ts
import { User } from "@/lib/types/auth";

export interface SrComplaintCategory {
  _id: string;
  categoryName: string;
  categoryCode: string;
  description?: string;
  priorityLevel: number;
  slaHours?: number;
  isActive: boolean;
  escalationLevels?: {
    level: number;
    role: string;
    hoursAfterCreation: number;
  }[];
  createdBy: string | User;
  updatedBy?: string | User;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  priorityLabel?: string;
  priorityColor?: string;
  slaDescription?: string;
}

export interface CreateSrComplaintCategoryDto {
  categoryName: string;
  categoryCode: string;
  description?: string;
  priorityLevel?: number;
  slaHours?: number;
  isActive?: boolean;
  escalationLevels?: {
    level: number;
    role: string;
    hoursAfterCreation: number;
  }[];
}

export interface UpdateSrComplaintCategoryDto {
  categoryName?: string;
  categoryCode?: string;
  description?: string;
  priorityLevel?: number;
  slaHours?: number;
  isActive?: boolean;
  escalationLevels?: {
    level: number;
    role: string;
    hoursAfterCreation: number;
  }[];
}

export interface SrComplaintCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  minPriority?: number;
  maxPriority?: number;
  maxSlaHours?: number;
}

export interface BulkUpdateResult {
  matched: number;
  modified: number;
}

export interface CategoryStatistics {
  totalCategories: number;
  activeCategories: number;
  avgPriorityLevel: number;
  avgSlaHours: number;
  byPriority: Record<number, { total: number; active: number }>;
}

export interface GetSrComplaintCategoriesResult {
  complaintCategories: SrComplaintCategory[];
  summary: {
    totalCategories: number;
    activeCategories: number;
    byPriority: Record<number, number>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ImportCategoriesResult {
  success: number;
  failed: number;
  errors: string[];
}

// Type alias for compatibility
export type SrComplaintCategoryType = SrComplaintCategory;

export interface CategoryDropdownItem {
  value: string;
  label: string;
  priority: number;
}
