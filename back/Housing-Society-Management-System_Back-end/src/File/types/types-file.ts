// src/database/File/types/types-file.ts
import { Types } from 'mongoose';
import { FileStatus, PaymentMode } from '../models/models-file';

export interface FileType {
  _id: Types.ObjectId;
  fileRegNo: string;
  fileBarCode: string;
  planId: Types.ObjectId;
  memId: Types.ObjectId;
  nomineeId?: Types.ObjectId;
  applicationId?: Types.ObjectId;
  plotId: Types.ObjectId; // REQUIRED

  contractPrice: number;
  priceSnapshotAt: Date;
  paymentMode: PaymentMode;
  isAdjusted: boolean;
  adjustmentRef?: string;
  status: FileStatus;
  fileRemarks?: string;
  bookingDate: Date;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  createdBy: Types.ObjectId;
  modifiedBy?: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  member?: any;
  nominee?: any;
  application?: any;
  plot?: any;
  createdByUser?: any;
  modifiedByUser?: any;
  // downPayment/balanceAmount/paymentPercentage are attached post-query by
  // fileService.attachFinancials() from the Installment ledger — not raw
  // schema fields, not writable via Create/UpdateFileDto.
  downPayment?: number;
  downPaymentPaid?: number;
  downPaymentStatus?: 'none' | 'unpaid' | 'partial' | 'paid';
  // balanceAmount === plotBalance (what's owed on the plot only). totalOutstanding
  // additionally includes possession/legal/other fee rows.
  balanceAmount?: number;
  plotBalance?: number;
  totalOutstanding?: number;
  paymentPercentage?: number;
  fileAge?: number;
  statusBadgeColor?: string;
}

export interface CreateFileDto {
  fileRegNo?: string;
  planId: string;
  memId: string;
  nomineeId?: string;
  applicationId?: string;
  plotId: string; // REQUIRED
  // contractPrice is NOT accepted from the client — it's snapshotted
  // server-side from Plot.plotTotalAmount in fileService.createFile.
  paymentMode: PaymentMode;
  isAdjusted?: boolean;
  adjustmentRef?: string;
  fileRemarks?: string;
  bookingDate: Date;
  expectedCompletionDate?: Date;
}

export interface UpdateFileDto {
  planId?: string;
  nomineeId?: string;
  plotId?: string;
  paymentMode?: PaymentMode;
  isAdjusted?: boolean;
  adjustmentRef?: string;
  status?: FileStatus;
  fileRemarks?: string;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  cancellationReason?: string;
  isActive?: boolean;
}

export interface FileQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fileRegNo?: string;
  fileBarCode?: string;
  projId?: string; // Filter by project
  projectId?: string; // Back-compat alias
  planId?: string;
  memId?: string;
  nomineeId?: string;
  plotId?: string;
  status?: FileStatus;
  isAdjusted?: boolean;
  isActive?: boolean;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: Date;
  toDate?: Date;
}

export interface FileStatistics {
  totalFiles: number;
  activeFiles: number;
  pendingFiles: number;
  cancelledFiles: number;
  closedFiles: number;
  totalContractPrice: number;
  totalDownPayment: number;
  averageContractPrice: number;
  averageDownPayment: number;
  byStatus: Record<string, number>;
  byProject: Record<string, number>;
  byMonth: Record<string, number>;
}

export interface FileDashboardSummary {
  totalFiles: number;
  activeFiles: number;
  pendingFiles: number;
  totalRevenue: number;
  recentFiles: FileType[];
  topProjects: Array<{
    projectId: Types.ObjectId;
    projectName: string;
    fileCount: number;
    totalContractPrice: number;
  }>;
}

export interface TransferFileDto {
  newMemberId: string;
  transferDate: Date;
  transferReason: string;
  transferFee?: number;
  transferRemarks?: string;
}

export interface ChangeNomineeDto {
  // Omitted/empty clears the file's nominee. When present, must belong to
  // the file's current member - enforced in fileService.changeNominee.
  nomineeId?: string;
}

export interface AdjustFileDto {
  adjustmentType: 'REFUND' | 'CREDIT' | 'TRANSFER';
  adjustmentAmount: number;
  adjustmentDate: Date;
  adjustmentReason: string;
  referenceFileId?: string;
  remarks?: string;
}

// Enhanced type with plot details
export interface FileWithPlotDetails extends FileType {
  plotDetails?: {
    plotBlock?: {
      _id: string;
      plotBlockName: string;
      plotBlockDesc?: string;
    };
    plotSize?: {
      _id: string;
      plotSizeName: string;
      totalArea: number;
      areaUnit: string;
      ratePerUnit: number;
    };
    plotType?: {
      _id: string;
      plotTypeName: string;
      plotTypeCode?: string;
    };
    plotCategory?: {
      _id: string;
      categoryName: string;
      surchargePercentage?: number;
      surchargeFixedAmount?: number;
    };
    salesStatus?: {
      _id: string;
      statusName: string;
      statusCode: string;
      colorCode?: string;
    };
    developmentStatus?: {
      _id: string;
      srDevStatName: string;
      devCategory: string;
      devPhase: string;
      percentageComplete: number;
    };
    project?: {
      _id: string;
      projName: string;
      projCode: string;
      projPrefix?: string;
      projLocation?: string;
    };
  };
}
