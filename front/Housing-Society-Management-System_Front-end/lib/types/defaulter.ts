export type DefaulterStatus = "Warning" | "Suspended" | "Legal Action" | "Resolved";

/** One row of the live, ledger-derived defaulter list. */
export interface DefaulterRow {
  fileId: string;
  file?: { _id: string; fileRegNo?: string; fileBarCode?: string };
  member?: { _id: string; memName?: string; fullName?: string; memNic?: string; mobileNo?: string };
  plot?: {
    _id: string;
    plotNo?: string;
    plotBlockId?: { _id: string; plotBlockName?: string };
  };

  daysOverdue: number;
  oldestUnpaidDueDate: string;

  installmentsOverdue: number;
  billsOverdue: number;
  totalOverdue: number;

  suggestedStatus: DefaulterStatus;
  statusOverride?: DefaulterStatus;
  actualStatus: DefaulterStatus;

  noticeSentCount: number;
  remarks?: string;
  workflowId?: string;
}

export interface DefaulterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: DefaulterStatus;
  minAmount?: number;
  maxAmount?: number;
  minDays?: number;
  maxDays?: number;
  sortBy?: "daysOverdue" | "totalOverdue" | "installmentsOverdue" | "billsOverdue";
  sortOrder?: "asc" | "desc";
}

export interface DefaulterStatistics {
  totalDefaulters: number;
  byStatus: Record<string, number>;
  totalOverdueAmount: number;
  totalInstallmentsOverdue: number;
  totalBillsOverdue: number;
  averageOverdueAmount: number;
  averageDaysOverdue: number;
  topDefaulters: Array<{
    fileId: string;
    fileRegNo?: string;
    memberName?: string;
    totalOverdue: number;
    daysOverdue: number;
  }>;
}

export interface SetStatusOverrideDto {
  status: DefaulterStatus | null;
}

export interface SetRemarksDto {
  remarks: string;
}

export interface SendNoticeDto {
  noticeType: "WARNING" | "FINAL" | "LEGAL";
  noticeContent: string;
  sendMethod: "EMAIL" | "SMS" | "LETTER" | "ALL";
}
