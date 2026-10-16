import { Types } from 'mongoose';

export interface Application {
  _id: Types.ObjectId;
  applicationNo: string;
  applicationTypeID: Types.ObjectId; // Reference to existing ApplicationType
  memId: Types.ObjectId;
  plotId?: Types.ObjectId;
  applicationDate: Date;
  statusId: Types.ObjectId;
  remarks?: string;
  attachmentPath?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface CreateApplicationDto {
  applicationTypeID: string;
  memId: string;
  plotId?: string;
  applicationDate: string | Date;
  statusId: string;
  remarks?: string;
  attachmentPath?: string;
}

export interface UpdateApplicationDto {
  applicationTypeID?: string;
  memId?: string;
  plotId?: string;
  applicationDate?: string | Date;
  statusId?: string;
  remarks?: string;
  attachmentPath?: string;
}

export interface ApplicationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  applicationNo?: string;
  applicationTypeID?: string;
  memId?: string;
  plotId?: string;
  statusId?: string;
  startDate?: string;
  endDate?: string;
  /** Match applicationType.applicationName against this substring (case-insensitive), e.g. 'transfer' */
  applicationTypeCategory?: string;
  /** Match status.statusName exactly (case-insensitive), e.g. 'Approved' */
  statusName?: string;
  /** Exclude applications already linked to a non-cancelled/rejected Transfer */
  excludeLinkedToTransfer?: boolean;
}

export interface ApplicationSummary {
  totalApplications: number;
  applicationsByType: { typeName: string; count: number }[];
  recentApplications: number;
  activeApplications?: number;
}
