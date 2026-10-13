import { UserRole } from "../constants/roles";

export interface UserNotificationPrefs {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  inApp?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  roleId?: string;
  societyId?: string;
  status: string;
  emailVerified: boolean;
  avatar?: string;
  address?: string;
  bio?: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: UserNotificationPrefs;
    privacy?: Record<string, unknown>;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface VerifyEmailOTPData {
  email: string;
  otp: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordOTPData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  data: {
    url: string;
  };
}
export interface ApiErrorResponse {
  success: boolean;
  error?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export type PermissionAction = 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canExport' | 'canImport' | 'canApprove' | 'canVerify';
export type PermissionsMap = Record<string, Record<PermissionAction, boolean>>;
