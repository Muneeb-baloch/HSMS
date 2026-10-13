// src/lib/types/installment.ts

export enum InstallmentStatus {
  UNPAID = "Unpaid",
  PARTIALLY_PAID = "Partially Paid",
  PAID = "Paid",
  OVERDUE = "Overdue",
  CANCELLED = "Cancelled",
  REFUNDED = "Refunded",
}

export enum InstallmentType {
  MONTHLY = "Monthly",
  QUARTERLY = "Quarterly",
  HALF_YEARLY = "Half-Yearly",
  YEARLY = "Yearly",
  BALLOON = "Balloon",
  DOWN_PAYMENT = "Down Payment",
  POSSESSION_FEE = "Possession Fee",
  BALLOTING_FEE = "Balloting Fee",
  UTILITY_CHARGES = "Utility Charges",
  DEVELOPMENT_CHARGES = "Development Charges",
  LEGAL_FEE = "Legal Fee",
  TRANSFER_FEE = "Transfer Fee",
  OTHER = "Other",
}

export enum PaymentMode {
  CASH = "Cash",
  BANK_TRANSFER = "Bank Transfer",
  CHEQUE = "Cheque",
  ONLINE_PAYMENT = "Online Payment",
  CREDIT_CARD = "Credit Card",
  DEBIT_CARD = "Debit Card",
  MOBILE_WALLET = "Mobile Wallet",
}

export interface Installment {
  _id: string;
  id?: string;
  fileId: string | { _id: string; fileRegNo: string; fileBarCode?: string };
  memId:
    | string
    | { _id: string; memName: string; memNic: string; mobileNo?: string };
  plotId:
    | string
    | { _id: string; plotNo: string; plotSize?: string; blockNo?: string };
  installmentCategoryId:
    | string
    | { _id: string; instCatName: string; instCatDescription?: string };
  installmentNo: number;
  installmentTitle: string;
  installmentType: InstallmentType;
  dueDate: Date;
  amountDue: number;
  lateFeeSurcharge?: number;
  totalPayable: number;
  amountPaid: number;
  balanceAmount: number;
  paidDate?: Date;
  paymentMode?: PaymentMode;
  transactionRefNo?: string;
  status: InstallmentStatus;
  installmentRemarks?: string;
  createdBy?: {
    _id: string;
    userName: string;
    fullName: string;
    designation?: string;
  };
  modifiedBy?: {
    _id: string;
    userName: string;
    fullName: string;
    designation?: string;
  };
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  file?: any;
  member?: any;
  plot?: any;
  installmentCategory?: any;
  isOverdue?: boolean;
  daysOverdue?: number;
  paymentStatusColor?: string;
}

export interface CreateInstallmentDto {
  fileId: string;
  memId: string;
  plotId: string;
  installmentCategoryId: string;
  installmentNo: number;
  installmentTitle: string;
  installmentType: InstallmentType;
  dueDate: Date | string;
  amountDue: number;
  lateFeeSurcharge?: number;
  installmentRemarks?: string;
}

export interface UpdateInstallmentDto {
  installmentNo?: number;
  installmentTitle?: string;
  installmentType?: InstallmentType;
  dueDate?: Date | string;
  amountDue?: number;
  lateFeeSurcharge?: number;
  amountPaid?: number;
  paidDate?: Date | string;
  paymentMode?: PaymentMode;
  transactionRefNo?: string;
  status?: InstallmentStatus;
  installmentRemarks?: string;
}

export interface RecordPaymentDto {
  amountPaid: number;
  paidDate: Date | string;
  paymentMode: PaymentMode;
  transactionRefNo?: string;
  remarks?: string;
}

export interface BulkInstallmentCreationDto {
  fileId: string;
  memId: string;
  plotId: string;
  installmentCategoryId: string;
  installmentType: InstallmentType;
  totalInstallments: number;
  amountPerInstallment: number;
  startDate: Date | string;
  frequency: "monthly" | "quarterly" | "half-yearly" | "yearly";
  installmentTitle?: string;
}

export interface InstallmentQueryParams {
  page?: number;
  limit?: number;
  fileId?: string;
  memId?: string;
  plotId?: string;
  installmentCategoryId?: string;
  status?: InstallmentStatus;
  installmentType?: InstallmentType;
  paymentMode?: PaymentMode;
  fromDate?: Date | string;
  toDate?: Date | string;
  overdue?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface InstallmentSummary {
  totalInstallments: number;
  totalAmountDue: number;
  totalAmountPaid: number;
  totalBalance: number;
  totalLateFee: number;
  paidInstallments: number;
  unpaidInstallments: number;
  overdueInstallments: number;
  partiallyPaidInstallments: number;
  byStatus: Record<
    string,
    { count: number; amount: number; paid: number; balance: number }
  >;
  byCategory: Record<string, { count: number; amount: number; paid: number }>;
  byMonth: Record<string, number>;
}

export interface InstallmentDashboardSummary {
  totalOutstanding: number;
  totalPaidToday: number;
  totalDueToday: number;
  totalOverdue: number;
  recentPayments: Installment[];
  upcomingDue: Installment[];
  topPayers: Array<{
    memId: string;
    memberName: string;
    totalPaid: number;
    totalDue: number;
  }>;
}

export interface InstallmentReportParams {
  startDate: Date | string;
  endDate: Date | string;
  fileId?: string;
  memId?: string;
  plotId?: string;
  installmentCategoryId?: string;
  status?: InstallmentStatus;
  installmentType?: InstallmentType;
}

export interface InstallmentReport {
  summary: {
    totalRecords: number;
    totalAmountDue: number;
    totalAmountPaid: number;
    totalBalance: number;
    totalLateFee: number;
  };
  data: Installment[];
  byDate: Array<{ date: string; amount: number; count: number }>;
  byCategory: Array<{ category: string; amount: number; count: number }>;
  byStatus: Array<{ status: string; amount: number; count: number }>;
}

export interface BulkStatusUpdateDto {
  installmentIds: string[];
  status: InstallmentStatus;
}

export interface PaymentValidation {
  isValid: boolean;
  message?: string;
  installment?: Installment;
  maxPaymentAllowed?: number;
}
