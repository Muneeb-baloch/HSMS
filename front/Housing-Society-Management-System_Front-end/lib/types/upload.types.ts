// frontend/src/lib/upload/types/upload.types.ts
export enum FileType {
  IMAGE = "image",
  DOCUMENT = "document",
  PDF = "pdf",
  OTHER = "other",
}

// lib/types/upload.types.ts - Update the EntityType enum
export enum EntityType {
  USER = "user",
  PLOT = "plot",
  PROJECT = "project",
  MEMBER = "member",
  DOCUMENT = "document",
  APPLICATION = "application",
  TRANSFER = "transfer",
  ANNOUNCEMENT = "announcement",
}
export interface UploadedFile {
  _id: string;
  url: string;
  secureUrl: string;
  publicId: string;
  fileName: string;
  originalName: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  pages?: number;
  entityType: EntityType;
  entityId: string;
  uploadedBy: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  formattedSize?: string;
}

export interface UploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  maxFiles: number;
  entityTypes: EntityType[];
  fileTypes: FileType[];
  cloudinaryCloudName: string;
}

export interface UploadRequest {
  entityType: EntityType;
  entityId: string;
  uploadedBy: string;
  file: File;
  metadata?: Record<string, unknown>;
}

export interface UploadState {
  files: UploadedFile[];
  loading: boolean;
  error: string | null;
  uploadProgress: Record<string, number>;
  uploadingFiles: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
export interface DeleteFileInput {
  id: string; // ID of the file to delete
  deletedBy: string; // User ID of the person deleting the file
}
