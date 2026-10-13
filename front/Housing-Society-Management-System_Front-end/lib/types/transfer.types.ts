export enum TransferStatus {
  PENDING = "Pending",
  UNDER_REVIEW = "Under Review",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
  ON_HOLD = "On Hold",
  DOCUMENTS_REQUIRED = "Documents Required",
  FEE_PENDING = "Fee Pending",
}

export interface Transfer {
  _id: string;
  fileId: string | { _id: string; fileRegNo: string; plotId?: string };
  transferTypeId:
    | string
    | { _id: string; typeName: string; transferFee?: number };
  sellerMemId: string | { _id: string; memName: string; memNic: string };
  buyerMemId: string | { _id: string; memName: string; memNic: string };
  applicationId?: string | { _id: string; applicationNo: string };

  ndcDocPath?: string;
  transferFeePaid: boolean;
  transferFeeAmount?: number;
  transferFeePaidDate?: Date;
  transferInitDate: Date;
  transferExecutionDate?: Date;
  witness1Name?: string;
  witness1CNIC?: string;
  witness2Name?: string;
  witness2CNIC?: string;
  officerName?: string;
  officerDesignation?: string;
  transfIsAtt: boolean;
  transfClearanceCertPath?: string;
  nomineeId?: string | { _id: string; nomineeName: string };
  status: TransferStatus;
  remarks?: string;
  legalReviewNotes?: string;
  cancellationReason?: string;
  createdBy: string | { _id: string; userName: string; fullName: string };
  modifiedBy?: string | { _id: string; userName: string; fullName: string };
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  file?: any;
  transferType?: any;
  seller?: any;
  buyer?: any;
  application?: any;
  nominee?: any;
  transferAge?: number;
  statusBadgeColor?: string;
  isOverdue?: boolean;
}

export interface CreateTransferDto {
  fileId: string;
  transferTypeId: string;
  sellerMemId: string;
  buyerMemId: string;
  applicationId?: string;
  ndcDocPath?: string;
  transferFeeAmount?: number;
  transferInitDate: string;
  witness1Name?: string;
  witness1CNIC?: string;
  witness2Name?: string;
  witness2CNIC?: string;
  transfIsAtt?: boolean;
  transfClearanceCertPath?: string;
  nomineeId?: string;
  remarks?: string;
}

export type UpdateTransferDto = Partial<CreateTransferDto> & {
  transferFeePaid?: boolean;
  transferFeePaidDate?: string;
  transferExecutionDate?: string;
  officerName?: string;
  officerDesignation?: string;
  status?: TransferStatus;
  legalReviewNotes?: string;
  cancellationReason?: string;
  isActive?: boolean;
};

export interface TransferQueryParams {
  page?: number;
  limit?: number;
  fileId?: string;
  sellerMemId?: string;
  buyerMemId?: string;
  transferTypeId?: string;
  status?: TransferStatus;
  transferFeePaid?: boolean;
  transfIsAtt?: boolean;
  isActive?: boolean;
  fromDate?: string;
  toDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RecordFeePaymentDto {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  receiptNumber?: string;
}

export interface ExecuteTransferDto {
  executionDate: string;
  witness1Name: string;
  witness1CNIC: string;
  witness2Name?: string;
  witness2CNIC?: string;
  officerName: string;
  officerDesignation: string;
  remarks?: string;
}

// Optional summary/statistics types used by the transfer API
export interface TransferStatistics {
  totalTransfers?: number;
  totalPending?: number;
  totalApproved?: number;
  totalRejected?: number;
  totalCompleted?: number;
  totalCancelled?: number;
  totalOverdue?: number;
  totalFeePending?: number;
  [key: string]: any;
}

export interface TransferDashboardSummary {
  totalOutstanding?: number; // total fees outstanding
  totalPaidToday?: number;
  totalDueToday?: number;
  totalOverdue?: number;
  recentTransfers?: Transfer[];
  [key: string]: any;
}
