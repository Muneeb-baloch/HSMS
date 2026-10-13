// lib/types/maintenance-request.ts

export interface WorkLogEntry {
  date: string;
  description: string;
  loggedBy: string;
  hoursWorked?: number;
  photos: string[];
}

export interface MaintenanceRequest {
  _id: string;
  requestNumber: string;
  societyId: string;
  requestedBy: string;
  plotId?: string;
  category: string;
  title: string;
  description: string;
  location: string;
  priority: "low" | "medium" | "high" | "urgent";
  images: { url: string; description?: string }[];
  status:
    | "submitted"
    | "acknowledged"
    | "assigned"
    | "in_progress"
    | "on_hold"
    | "completed"
    | "verified"
    | "closed"
    | "rejected";
  assignedTo?: string;
  assignedVendor?: string;
  estimatedCost?: number;
  actualCost?: number;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  workLog: WorkLogEntry[];
  residentFeedback?: {
    rating: number;
    comment: string;
    feedbackDate: string;
  };
  rejectionReason?: string;
  slaDeadline?: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceDto {
  societyId: string;
  plotId?: string;
  category: string;
  title: string;
  description: string;
  location: string;
  priority?: string;
  images?: { url: string; description?: string }[];
}

export interface MaintenanceQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  category?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  isOverdue?: boolean;
  search?: string;
}
