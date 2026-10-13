// lib/types/vendor.ts

export interface VendorProfile {
  _id: string;
  vendorName: string;
  companyName?: string;
  email: string;
  phone: string;
  address?: string;
  vendorType: string;
  registrationNumber?: string;
  taxId?: string;
  serviceAreas: string[];
  documents: { name: string; fileUrl: string; fileType: string }[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountTitle: string;
    branchCode: string;
  };
  status: "pending-verification" | "active" | "suspended" | "blacklisted";
  verifiedBy?: string;
  verificationDate?: string;
  rating: number;
  totalRatings: number;
  totalContracts: number;
  completedContracts: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  _id: string;
  title: string;
  description: string;
  societyId: string;
  category: string;
  estimatedBudget?: number;
  deadline?: string;
  scope?: string;
  documents: { name: string; fileUrl: string }[];
  status:
    | "draft"
    | "open"
    | "bidding"
    | "awarded"
    | "in-progress"
    | "completed"
    | "cancelled";
  awardedVendorId?: string;
  awardedAmount?: number;
  bids: {
    vendorId: string;
    amount: number;
    proposal: string;
    submittedAt: string;
    status: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorContract {
  _id: string;
  vendorId: string;
  societyId: string;
  workOrderId?: string;
  contractName: string;
  description?: string;
  scope?: string;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  amount: number;
  paymentFrequency: string;
  status: "draft" | "active" | "expired" | "terminated" | "renewed";
  documents: { name: string; fileUrl: string }[];
  performanceReviews: {
    date: string;
    rating: number;
    comments: string;
    reviewedBy: string;
  }[];
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorInvoice {
  _id: string;
  vendorId: string;
  societyId: string;
  contractId?: string;
  workOrderId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  description?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  documents: { name: string; fileUrl: string }[];
  status:
    | "submitted"
    | "under-review"
    | "approved"
    | "paid"
    | "rejected"
    | "disputed";
  approvedBy?: string;
  paymentDate?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

// Vendor DTOs and QueryParams
export interface CreateVendorDto {
  vendorName: string;
  companyName?: string;
  email: string;
  phone: string;
  address?: string;
  vendorType: string;
  registrationNumber?: string;
  taxId?: string;
  serviceAreas?: string[];
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

export interface VendorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  vendorType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Work Order DTOs and QueryParams
export interface CreateWorkOrderDto {
  title: string;
  description: string;
  societyId: string;
  category: string;
  estimatedBudget?: number;
  deadline?: string;
  scope?: string;
}

export interface UpdateWorkOrderDto extends Partial<CreateWorkOrderDto> {}

export interface WorkOrderQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  status?: string;
  category?: string;
}

// Contract DTOs and QueryParams
export interface CreateContractDto {
  vendorId: string;
  societyId: string;
  workOrderId?: string;
  contractName: string;
  description?: string;
  scope?: string;
  startDate: string;
  endDate: string;
  amount: number;
  paymentFrequency?: string;
  autoRenew?: boolean;
}

export interface UpdateContractDto extends Partial<CreateContractDto> {}

export interface ContractQueryParams {
  page?: number;
  limit?: number;
  vendorId?: string;
  societyId?: string;
  status?: string;
}

// Invoice DTOs and QueryParams
export interface CreateInvoiceDto {
  vendorId: string;
  societyId: string;
  contractId?: string;
  workOrderId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  description?: string;
  lineItems?: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  vendorId?: string;
  societyId?: string;
  status?: string;
}
