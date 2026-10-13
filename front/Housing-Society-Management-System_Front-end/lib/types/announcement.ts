export interface Announcement {
  _id: string;
  title: string;
  announcementDesc: string;
  shortDescription?: string;
  authorId: any; // populated UserStaff
  categoryId: any; // populated AnnouncementCategory
  targetType: "All" | "Block" | "Project" | "Individual";
  targetGroupId?: any;
  priorityLevel: 1 | 2 | 3;
  status: "Draft" | "Published" | "Archived";
  attachmentURL?: string;
  isPushNotificationSent: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  views: number;
  createdBy?: { _id: string; userName: string; fullName: string };
  updatedBy?: { _id: string; userName: string; fullName: string };
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;

  // virtuals / populated
  author?: any;
  category?: any;
  targetGroup?: any;
  priorityLabel?: string;
  statusBadge?: string;
  isExpired?: boolean;
  daysRemaining?: number;
}

export interface CreateAnnouncementDto {
  authorId: string;
  categoryId: string;
  title: string;
  announcementDesc: string;
  shortDescription?: string;
  targetType: "All" | "Block" | "Project" | "Individual";
  targetGroupId?: string;
  priorityLevel: 1 | 2 | 3;
  attachmentURL?: string;
  expiresAt?: string;
}

export interface UpdateAnnouncementDto {
  authorId?: string;
  categoryId?: string;
  title?: string;
  announcementDesc?: string;
  shortDescription?: string;
  targetType?: "All" | "Block" | "Project" | "Individual";
  targetGroupId?: string;
  priorityLevel?: 1 | 2 | 3;
  attachmentURL?: string;
  expiresAt?: string;
}

export interface PublishAnnouncementDto {
  expiresAt?: string;
  sendPushNotification?: boolean;
}

export interface AnnouncementQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  authorId?: string;
  targetType?: string;
  targetGroupId?: string;
  priorityLevel?: number;
  status?: string;
  isActive?: boolean;
  isPushNotificationSent?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
