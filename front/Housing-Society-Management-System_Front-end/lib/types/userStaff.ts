// src/lib/types/userStaff.ts
import { User } from "@/lib/types/auth";

export interface UserStaff {
  _id: string;
  userName: string;
  password?: string;
  fullName: string;
  cnic: string;
  mobileNo?: string;
  email?: string;
  roleId: string | any;
  cityId: string | any;
  designation?: string;
  isActive: boolean;
  lastLogin?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
  createdBy: string | User;
  updatedBy?: string | User;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserStaffDto {
  userName: string;
  password: string;
  fullName: string;
  cnic: string;
  mobileNo?: string;
  email?: string;
  roleId: string;
  cityId: string;
  designation?: string;
  isActive?: boolean;
}

export interface UpdateUserStaffDto {
  userName?: string;
  password?: string;
  fullName?: string;
  cnic?: string;
  mobileNo?: string;
  email?: string;
  roleId?: string;
  cityId?: string;
  designation?: string;
  isActive?: boolean;
}

export interface ResetPasswordDto {
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface UserStaffQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  cityId?: string;
  designation?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserStaffStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  usersWithEmail: number;
  usersWithoutEmail: number;
  byRole: Record<string, number>;
  byCity: Record<string, number>;
  byDesignation: Record<string, number>;
  monthlyGrowth: Array<{
    month: string;
    count: number;
  }>;
}

export interface PaginatedUserStaffs {
  items: UserStaff[];
  summary: {
    totalUsers: number;
    activeUsers: number;
    byRole: Record<string, number>;
    byCity: Record<string, number>;
    byDesignation: Record<string, number>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BulkUpdateResult {
  matched: number;
  modified: number;
}
