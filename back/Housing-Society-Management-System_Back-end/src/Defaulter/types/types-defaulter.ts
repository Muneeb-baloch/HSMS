import { Types } from 'mongoose';
import { DefaulterStatus } from '../models/models-defaulter-workflow';

/** One row of the live, ledger-derived defaulter list. */
export interface DefaulterRow {
  fileId: Types.ObjectId;
  file?: any;
  member?: any;
  plot?: any;

  /** Days since the oldest due date among this file's still-unpaid installments and bills. */
  daysOverdue: number;
  /** ISO date string of that oldest unpaid due date. */
  oldestUnpaidDueDate: Date;

  installmentsOverdue: number;
  billsOverdue: number;
  totalOverdue: number;

  /** Derived purely from daysOverdue: Warning 30+ / Suspended 90+ / Legal Action 180+. */
  suggestedStatus: DefaulterStatus;
  /** Staff override from DefaulterWorkflow, if set. */
  statusOverride?: DefaulterStatus;
  /** statusOverride ?? suggestedStatus - what should actually be shown/acted on. */
  actualStatus: DefaulterStatus;

  noticeSentCount: number;
  remarks?: string;
  workflowId?: Types.ObjectId;
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
  sortBy?: 'daysOverdue' | 'totalOverdue' | 'installmentsOverdue' | 'billsOverdue';
  sortOrder?: 'asc' | 'desc';
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
    fileId: Types.ObjectId;
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
  noticeType: 'WARNING' | 'FINAL' | 'LEGAL';
  noticeContent: string;
  sendMethod: 'EMAIL' | 'SMS' | 'LETTER' | 'ALL';
}
