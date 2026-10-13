// src/lib/types/announcementCategory.ts
export interface AnnouncementCategory {
  _id: string;
  categoryName: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  isSystem: boolean;
  priority: number;
  createdBy?: {
    _id: string;
    userName: string;
    fullName: string;
    email?: string;
  };
  updatedBy?: {
    _id: string;
    userName: string;
    fullName: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  // Virtuals
  announcementCount?: number;
  categoryBadgeColor?: string;
  usagePercentage?: number;
}

export interface CreateAnnouncementCategoryDto {
  categoryName: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateAnnouncementCategoryDto {
  categoryName?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  priority?: number;
}

export interface AnnouncementCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AnnouncementCategorySummary {
  totalCategories: number;
  activeCategories: number;
  systemCategories: number;
}

export interface AnnouncementCategoryStatistics {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  systemCategories: number;
  averagePriority: number;
  maxPriority: number;
  minPriority: number;
  categoriesWithAnnouncements: number;
  categoriesWithoutAnnouncements: number;
  totalAnnouncements: number;
  maxAnnouncementsPerCategory: number;
  byColor: Record<string, number>;
  monthlyGrowth: Array<{ month: string; count: number }>;
}

export interface GetAnnouncementCategoriesResult {
  announcementCategories: AnnouncementCategory[];
  summary: AnnouncementCategorySummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
