// lib/types/api.ts
export interface ApiError {
  status?: number;
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}
