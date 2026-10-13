// src/lib/types/paymentMode.ts
import { User } from "@/lib/types/auth";

export interface PaymentMode {
  _id: string;
  paymentModeName: string;
  description?: string;
  isActive: boolean;
  createdBy: string | User;
  createdAt: Date;
  updatedBy?: string | User;
  updatedAt: Date;
  modifiedOn?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface CreatePaymentModeDto {
  paymentModeName: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePaymentModeDto {
  paymentModeName?: string;
  description?: string;
  isActive?: boolean;
}

export interface PaymentModeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}

export interface PaymentModeSummary {
  totalPaymentModes: number;
  activePaymentModes: number;
  inactivePaymentModes: number;
}

export interface GetPaymentModesResult {
  paymentModes: PaymentMode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaymentModeDropdownItem {
  id: string;
  name: string;
  description?: string;
}
