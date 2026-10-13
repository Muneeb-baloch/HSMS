// src/lib/types/complaint.ts
export type ComplaintPriority = "low" | "medium" | "high" | "emergency";
export type ComplaintStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected"
  | "reopened"
  | "on_hold";

export interface Complaint {
  _id: string;
  memId: string | { _id: string; memName: string; memNic?: string };
  fileId?: string | { _id: string; fileRegNo?: string; fileBarCode?: string };
  compCatId: string | { _id: string; categoryName: string; categoryCode?: string };
  compTitle: string;
  compDescription: string;
  compDate: Date | string;
  compPriority: ComplaintPriority;
  statusId: string | { _id: string; statusName: string };
  status?: ComplaintStatus;
  assignedTo?: string | { _id: string; firstName: string; lastName: string; email?: string };
  resolutionNotes?: string;
  resolutionDate?: Date | string;
  attachmentPaths: string[];
  dueDate?: Date | string;
  escalationLevel: number;
  isEscalated: boolean;
  slaBreached?: boolean;
  createdBy?: { _id: string; firstName: string; lastName: string };
  updatedBy?: { _id: string; firstName: string; lastName: string };
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeleted?: boolean;
}

export interface CreateComplaintDto {
  memId: string;
  fileId?: string;
  compCatId: string;
  compTitle: string;
  compDescription: string;
  compDate?: string | Date;
  compPriority?: ComplaintPriority;
  statusId?: string;
  assignedTo?: string;
  attachmentPaths?: string[];
}

export interface UpdateComplaintDto {
  compTitle?: string;
  compDescription?: string;
  compPriority?: ComplaintPriority;
  statusId?: string;
  assignedTo?: string;
  resolutionNotes?: string;
  attachmentPaths?: string[];
}

export interface ComplaintQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  memId?: string;
  fileId?: string;
  compCatId?: string;
  statusId?: string;
  compPriority?: ComplaintPriority;
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AssignComplaintDto {
  assignedTo: string;
  estimatedResolutionDate?: string;
}

export interface ResolveComplaintDto {
  resolutionNotes: string;
  satisfactionRating?: number;
  feedback?: string;
}

export interface EscalateComplaintDto {
  escalationLevel: number;
  assignedTo?: string;
  notes: string;
}
