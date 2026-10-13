export type BillStatus =
  | "Pending"
  | "Paid"
  | "Partially Paid"
  | "Overdue"
  | "Cancelled"
  | "Disputed";

export interface BillTypePopulated {
  _id: string;
  billTypeName: string;
  billTypeCategory?: string;
  defaultAmount?: number;
  isRecurring?: boolean;
}

export interface BillInfo {
  _id: string;
  billNo: string;
  billTypeId: string;
  billType?: BillTypePopulated;
  fileId:
    | string
    | { _id: string; fileNo?: string; fileRegNo?: string; fileType?: string };
  memId: string | { _id: string; fullName?: string; memName?: string; memNic?: string; mobileNo?: string };
  billMonth: string;
  previousReading?: number;
  currentReading?: number;
  unitsConsumed?: number;
  billAmount: number;
  fineAmount: number;
  arrears: number;
  totalPayable: number;
  dueDate: Date | string;
  gracePeriodDays: number;
  status: BillStatus;
  paymentDate?: Date | string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdBy?: string | { _id: string; fullName?: string; userName?: string };
  modifiedBy?: string | { _id: string; fullName?: string };
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  isOverdue?: boolean;
  daysOverdue?: number;
  totalPaid?: number;
  remainingBalance?: number;
}

export interface CreateBillInfoDto {
  billNo?: string;
  billTypeId: string;
  fileId: string;
  memId: string;
  billMonth: string;
  previousReading?: number;
  currentReading?: number;
  billAmount: number;
  fineAmount?: number;
  arrears?: number;
  dueDate: string | Date;
  gracePeriodDays?: number;
  notes?: string;
}

export interface UpdateBillInfoDto {
  previousReading?: number;
  currentReading?: number;
  billAmount?: number;
  fineAmount?: number;
  arrears?: number;
  dueDate?: string | Date;
  gracePeriodDays?: number;
  status?: BillStatus;
  paymentDate?: string | Date;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  isActive?: boolean;
}

export interface RecordPaymentDto {
  paymentAmount: number;
  paymentDate: string | Date;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface GenerateBillsDto {
  memberIds: string[];
  billTypeId: string;
  billMonth: string;
  dueDate: string | Date;
  gracePeriodDays?: number;
  templateData?: Record<string, unknown>;
}

export interface BillInfoQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  memId?: string;
  fileId?: string;
  billTypeId?: string;
  status?: BillStatus;
  billMonth?: string;
  year?: number;
  isOverdue?: boolean;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BillStatistics {
  totalBills: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  byType?: Record<string, number>;
  byMonth?: Record<string, number>;
  byStatus?: Record<string, number>;
}

export interface BillDashboardSummary {
  statistics: BillStatistics;
  recentOverdue: BillInfo[];
}
