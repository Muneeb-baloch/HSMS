// src/lib/types/file.ts
export interface File {
  _id: string;
  id: string;
  fileRegNo: string;
  fileBarCode: string;
  planId?: string;
  plan?: {
    _id?: string;
    id?: string;
    planName: string;
    totalMonths: number;
    totalAmount: number;
    projId?: string;
  };
  projectId: string;
  project?: {
    id: string;
    projName: string;
    projCode?: string;
    projLocation?: string;
    statusColor?: string;
    _id: string;
  };
  memId: string;
  member?: {
    id: string;
    memName: string;
    memNic: string;
    memRegNo?: string;
    mobileNo?: string;
    isLocked: boolean;
    _id: string;
  };
  nomineeId?: string;
  nominee?: {
    id: string;
    nomineeName: string;
    nomineeCNIC: string;
    nomineeContact: string;
    relationWithMember: string;
    relationBadgeColor?: string;
    _id: string;
  };
  applicationId?: string;
  application?: {
    id: string;
    applicationNo: string;
    applicationDate: string;
    statusId?: {
      statusName: string;
    };
    status?: string;
    _id: string;
  };
  plotId: string;
  plot?: {
    id: string;
    plotNo: string;
    plotArea: number;
    plotAreaUnit: string;
    formattedArea: string;
    projectId:
      | string
      | {
          id: string;
          projName: string;
          projCode?: string;
          projLocation?: string;
          statusColor?: string;
          formattedArea?: string | null;
          nextPlotNumber?: string | null;
          progressPercentage?: number | null;
          projectAgeMonths?: number;
          _id: string;
        };
    plotBlockId?: {
      plotBlockName: string;
      _id: string;
    };
    plotCategoryId?: {
      categoryName: string;
      _id: string;
    };
    plotSizeId?: {
      plotSizeName: string;
      _id: string;
    };
    plotType?: string;
    plotDimensions: string;
    plotRegistrationNo: string;
    plotRemarks?: string;
    plotNetPrice: number;
    plotTotalAmount: number;
    formattedTotalAmount: string;
    pricePerUnit: number;
    discountAmount: number;
    discountPercentage: number;
    plotStatus?: {
      developmentStatus: {
        srDevStatName: string;
        percentageComplete: number;
        phaseDescription: string;
        progressColor: string;
      };
      salesStatus: {
        statusName: string;
        colorCode: string;
      };
    };
    isAvailable: boolean;
    isPossessionReady: boolean;
    nextActions?: string[];
    _id: string;
  };
  // contractPrice is server-snapshotted from the plot's price at booking —
  // never entered by hand. downPayment/balanceAmount/paymentPercentage are
  // computed from the Installment ledger on every read, not stored fields.
  contractPrice: number;
  priceSnapshotAt?: string;
  downPayment?: number;
  downPaymentPaid?: number;
  downPaymentStatus?: 'none' | 'unpaid' | 'partial' | 'paid';
  // balanceAmount === plotBalance (what's owed on the plot only, excludes
  // possession/legal/other fee rows). totalOutstanding includes those fees too.
  plotBalance?: number;
  totalOutstanding?: number;
  paymentMode: string;
  isAdjusted: boolean;
  adjustmentRef?: string;
  status: string;
  statusBadgeColor?: string;
  fileRemarks?: string;
  bookingDate: Date | string;
  expectedCompletionDate?: Date | string;
  actualCompletionDate?: Date | string;
  cancellationDate?: Date | string;
  cancellationReason?: string;
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
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | string;
  balanceAmount?: number;
  paymentPercentage?: number;
  fileAge?: number;
  surchargeAmount?: number;
}

export interface CreateFileDto {
  fileRegNo?: string;
  fileBarCode: string;
  planId?: string;
  projId?: string;
  memId: string;
  nomineeId?: string;
  applicationId?: string;
  plotId: string;
  societyId?: string;
  // contractPrice is NOT submitted — the server snapshots it from the plot.
  paymentMode: string;
  isAdjusted?: boolean;
  adjustmentRef?: string;
  fileRemarks?: string;
  bookingDate: string | Date;
  expectedCompletionDate?: string | Date;
}

export interface UpdateFileDto {
  fileBarCode?: string;
  planId?: string;
  nomineeId?: string;
  plotId?: string;
  paymentMode?: string;
  isAdjusted?: boolean;
  adjustmentRef?: string;
  status?: string;
  fileRemarks?: string;
  expectedCompletionDate?: string | Date;
  actualCompletionDate?: string | Date;
  cancellationReason?: string;
  isActive?: boolean;
}

export interface FileQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fileRegNo?: string;
  fileBarCode?: string;
  projId?: string;
  planId?: string;
  memId?: string;
  nomineeId?: string;
  plotId?: string;
  status?: string;
  isAdjusted?: boolean;
  isActive?: boolean;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
}

export interface FileSummary {
  totalFiles: number;
  activeFiles: number;
  pendingFiles: number;
  recentFiles: number;
  filesByStatus: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  totalRevenue: number;
}

export interface FileDropdown {
  _id: string;
  fileRegNo: string;
  member?: {
    memName: string;
  };
  project?: {
    projName: string;
  };
}

export enum PaymentMode {
  CASH = "Cash",
  BANK_TRANSFER = "Bank Transfer",
  CHEQUE = "Cheque",
  CREDIT_CARD = "Credit Card",
  DEBIT_CARD = "Debit Card",
  ONLINE = "Online",
  MOBILE_WALLET = "Mobile Wallet",
  OTHER = "Other",
}

export enum FileStatus {
  ACTIVE = "Active",
  PENDING = "Pending",
  CANCELLED = "Cancelled",
  MERGED = "Merged",
  CLOSED = "Closed",
  SUSPENDED = "Suspended",
  TRANSFERRED = "Transferred",
  DISPUTED = "Disputed",
}
