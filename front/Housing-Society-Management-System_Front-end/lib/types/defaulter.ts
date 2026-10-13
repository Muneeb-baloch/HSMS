export type DefaulterStatus =
  | "Warning"
  | "Suspended"
  | "Legal Action"
  | "Resolved";

export interface Defaulter {
  _id: string;
  memId: string | { _id: string; memName?: string; fullName?: string; memNic?: string };
  plotId:
    | string
    | {
        _id: string;
        plotNo?: string;
        plotBlockId?: { plotBlockName?: string };
        projectId?: { projName?: string };
      };
  fileId: string | { _id: string; fileRegNo?: string; fileNo?: string };
  totalOverdueAmount: number;
  lastPaymentDate?: Date | string;
  daysOverdue: number;
  noticeSentCount: number;
  status: DefaulterStatus;
  remarks?: string;
  createdBy?: string | { _id: string; fullName?: string; userName?: string };
  modifiedBy?: string | { _id: string; fullName?: string; userName?: string };
  isActive: boolean;
  resolvedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateDefaulterDto {
  memId: string;
  plotId: string;
  fileId: string;
  totalOverdueAmount: number;
  lastPaymentDate?: string | Date;
  noticeSentCount?: number;
  remarks?: string;
}

export interface UpdateDefaulterDto {
  totalOverdueAmount?: number;
  lastPaymentDate?: string | Date;
  noticeSentCount?: number;
  status?: DefaulterStatus;
  remarks?: string;
  isActive?: boolean;
}

export interface DefaulterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  memId?: string;
  plotId?: string;
  fileId?: string;
  status?: DefaulterStatus;
  minAmount?: number;
  maxAmount?: number;
  minDays?: number;
  maxDays?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DefaulterStatistics {
  totalDefaulters: number;
  activeDefaulters: number;
  byStatus: Record<string, number>;
  totalOverdueAmount: number;
  averageOverdueAmount: number;
  averageDaysOverdue: number;
  topDefaulters: Array<{
    memId: string;
    memName: string;
    totalAmount: number;
    daysOverdue: number;
  }>;
  byNoticeCount: Record<string, number>;
}

export interface OverdueSummary {
  totalAmount: number;
  byStatus: Array<{ status: string; amount: number; count: number }>;
  byDaysRange: Array<{ range: string; amount: number; count: number }>;
}

export interface ActiveCountResponse {
  activeDefaulters: number;
  totalOverdueAmount: number;
}

export interface SendNoticeDto {
  noticeType: "WARNING" | "FINAL" | "LEGAL";
  noticeContent: string;
  sendMethod: "EMAIL" | "SMS" | "LETTER" | "ALL";
}

export interface ResolveDefaulterDto {
  paymentAmount: number;
  paymentDate: string | Date;
  paymentMethod: string;
  transactionId?: string;
  remarks?: string;
}

export interface BulkUpdateStatusDto {
  defaulterIds: string[];
  status: DefaulterStatus;
}
