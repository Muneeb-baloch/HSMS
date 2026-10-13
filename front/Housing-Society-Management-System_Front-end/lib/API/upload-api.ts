// frontend/src/lib/api/upload-api.ts
import axios, { AxiosInstance, AxiosProgressEvent } from "axios";
import { PaginatedResponse } from "../types/api";
import {
  EntityType,
  UploadConfig,
  UploadRequest,
  UploadedFile,
} from "../types/upload.types";
interface UploadOptions {
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  signal?: AbortSignal;
}

class UploadApi {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    this.client = axios.create({
      baseURL: this.baseURL,
      // headers: {
      //   "Content-Type": "application/json",
      // },
    });

    // Add auth interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Get upload configuration
   */
  async getConfig(): Promise<UploadConfig> {
    const response = await this.client.get("/uploads/config");
    return response.data.data;
  }

  /**
   * Upload single file
   */
  async uploadSingle(
    data: UploadRequest,
    options?: UploadOptions,
  ): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("entityType", data.entityType);
    formData.append("entityId", data.entityId);
    formData.append("uploadedBy", data.uploadedBy);

    if (data.metadata) {
      formData.append("metadata", JSON.stringify(data.metadata));
    }

    const response = await this.client.post(
      "/uploads/upload/single",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: options?.onUploadProgress,
        signal: options?.signal,
      },
    );

    return response.data.data;
  }
  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    data: Omit<UploadRequest, "file">,
    options?: UploadOptions,
  ): Promise<UploadedFile[]> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("entityType", data.entityType);
    formData.append("entityId", data.entityId);
    formData.append("uploadedBy", data.uploadedBy);

    if (data.metadata) {
      formData.append("metadata", JSON.stringify(data.metadata));
    }

    const response = await this.client.post(
      "/uploads/upload/multiple",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        onUploadProgress: options?.onUploadProgress,
        signal: options?.signal,
      },
    );

    return response.data.data;
  }

  /**
   * Get files with pagination
   */
  async getFiles(params?: {
    entityType?: EntityType;
    entityId?: string;
    fileType?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<UploadedFile>> {
    const response = await this.client.get("/uploads/files", { params });
    return response.data.data;
  }

  /**
   * Get files by entity
   */
  async getFilesByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<UploadedFile[]> {
    const response = await this.client.get(
      `/uploads/entities/${entityType}/${entityId}`,
    );
    return response.data.data;
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string): Promise<UploadedFile> {
    const response = await this.client.get(`/uploads/files/${id}`);
    return response.data.data;
  }

  /**
   * Update file
   */
  async updateFile(
    id: string,
    data: { file?: File; metadata?: UploadedFile; updatedBy: string },
  ): Promise<UploadedFile> {
    const formData = new FormData();

    if (data.file) {
      formData.append("file", data.file);
    }

    formData.append("updatedBy", data.updatedBy);

    if (data.metadata) {
      formData.append("metadata", JSON.stringify(data.metadata));
    }

    const response = await this.client.put(`/uploads/files/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, deletedBy: string): Promise<UploadedFile> {
    const response = await this.client.delete(`/uploads/files/${id}`, {
      data: { deletedBy },
    });
    return response.data.data;
  }
}

// Export singleton instance
export const uploadApi = new UploadApi();
