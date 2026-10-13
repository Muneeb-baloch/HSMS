// src/lib/types/application.ts
export interface Application {
  _id: string;
  applicationNo: string;
  applicationDesc?: string;
  applicationTypeID: any;
  memId: any;
  plotId?: any;
  applicationDate: Date;
  statusId: any;
  remarks?: string;
  attachmentPath?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
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
  sortOrder?: "asc" | "desc";
  applicationNo?: string;
  applicationTypeID?: string;
  memId?: string;
  plotId?: string;
  statusId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApplicationSummary {
  totalApplications: number;
  activeApplications: number;
  recentApplications: number;
  applicationsByType: Array<{
    typeName: string;
    count: number;
  }>;
}

export interface ApplicationDropdown {
  _id: string;
  applicationNo: string;
  applicationTypeID: {
    _id: string;
    applicationName: string;
  };
}

export interface ApplicationDropdown {
  _id: string;
  applicationNo: string;
  applicationTypeID: {
    _id: string;
    applicationName: string;
  };
}
