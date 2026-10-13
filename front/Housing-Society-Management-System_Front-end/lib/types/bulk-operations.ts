export interface ImportLog {
  _id: string;
  importId: string;
  societyId: string;
  entityType: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  errors: {
    row: number;
    field: string;
    message: string;
    data?: Record<string, unknown>;
  }[];
  importedBy: string;
  completedAt?: string;
  createdAt: string;
}

export interface ImportTemplate {
  columns: {
    key: string;
    label: string;
    required: boolean;
    type: string;
    example: string;
  }[];
  csvHeader: string;
  exampleData: string;
}

export interface ExportParams {
  entityType: string;
  societyId: string;
  filters?: Record<string, unknown>;
  format?: "csv" | "json";
}

export interface ImportParams {
  entityType: string;
  societyId: string;
  csvData: string;
}

export interface ImportResult {
  importId: string;
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: { row: number; field: string; message: string }[];
}

export interface ImportLogQueryParams {
  page?: number;
  limit?: number;
  entityType?: string;
  status?: string;
}
