// frontend/src/lib/upload/hooks/useFiles.ts
import { uploadApi } from "@/lib/API/upload-api";
import { ApiError } from "@/lib/types/api";
import {
  DeleteFileInput,
  EntityType,
  UploadedFile,
} from "@/lib/types/upload.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Error from "next/dist/pages/_error";

import { useEffect } from "react";
import { customToast } from "@/lib/utils/customToast";
// Query keys
export const uploadKeys = {
  all: ["uploads"] as const,
  lists: () => [...uploadKeys.all, "list"] as const,
  list: (filters: any) => [...uploadKeys.lists(), filters] as const,
  details: () => [...uploadKeys.all, "detail"] as const,
  detail: (id: string) => [...uploadKeys.details(), id] as const,
  entity: (entityType: EntityType, entityId: string) =>
    [...uploadKeys.lists(), entityType, entityId] as const,
  config: () => [...uploadKeys.all, "config"] as const,
};
type UpdateFileInput = {
  id: string;
  data: {
    file?: File;
    metadata?: UploadedFile;
    updatedBy: string;
  };
};
/**
 * Hook to get upload configuration
 */
export function useUploadConfig() {
  const query = useQuery({
    queryKey: uploadKeys.config(),
    queryFn: () => uploadApi.getConfig(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (query.isError) {
      customToast.error("Failed to load upload configuration");
    }
  }, [query.isError]);

  return query;
}

/**
 * Hook to get files by entity
 */
export function useFilesByEntity(entityType?: EntityType, entityId?: string) {
  const query = useQuery({
    queryKey: uploadKeys.entity(entityType!, entityId!),
    queryFn: () => uploadApi.getFilesByEntity(entityType!, entityId!),
    enabled: !!entityType && !!entityId,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (query.isError) {
      customToast.error("Failed to load files");
    }
  }, [query.isError]);

  return query;
}

/**
 * Hook to get files with pagination
 */
export function useFiles(params?: {
  entityType?: EntityType;
  entityId?: string;
  fileType?: string;
  page?: number;
  limit?: number;
}) {
  const query = useQuery({
    queryKey: uploadKeys.list(params),
    queryFn: () => uploadApi.getFiles(params),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (query.isError) {
      customToast.error("Failed to load files");
    }
  }, [query.isError]);

  return query;
}

/**
 * Hook to upload single file
 */
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadApi.uploadSingle,
    onMutate: async (newUpload) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: uploadKeys.entity(newUpload.entityType, newUpload.entityId),
      });

      // Return context for rollback
      return { entityType: newUpload.entityType, entityId: newUpload.entityId };
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: uploadKeys.entity(variables.entityType, variables.entityId),
      });

      customToast.success("File uploaded successfully");
    },
    onError: (error: ApiError, variables, context) => {
      customToast.error(error.response?.data?.message || "Upload failed");
    },
  });
}

/**
 * Hook to upload multiple files
 */
export function useUploadMultipleFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      ...data
    }: { files: File[] } & Omit<
      Parameters<typeof uploadApi.uploadMultiple>[1],
      "files"
    >) => uploadApi.uploadMultiple(files, data),
    onMutate: async (newUpload) => {
      await queryClient.cancelQueries({
        queryKey: uploadKeys.entity(newUpload.entityType, newUpload.entityId),
      });

      return { entityType: newUpload.entityType, entityId: newUpload.entityId };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: uploadKeys.entity(variables.entityType, variables.entityId),
      });

      customToast.success(`${variables.files.length} files uploaded successfully`);
    },
    onError: (error: ApiError, variables, context) => {
      customToast.error(error.response?.data?.message || "Upload failed");
    },
  });
}

/**
 * Hook to delete file*/
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation<
    UploadedFile,
    Error,
    DeleteFileInput,
    { previousFiles?: UploadedFile[] }
  >({
    mutationFn: ({ id, deletedBy }) => uploadApi.deleteFile(id, deletedBy),

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: uploadKeys.all });

      const previousFiles = queryClient.getQueryData<UploadedFile[]>(
        uploadKeys.all,
      );

      queryClient.setQueryData<UploadedFile[]>(
        uploadKeys.all,
        (old) => old?.filter((file) => file._id !== id) || [],
      );

      return { previousFiles };
    },

    onSuccess: () => {
      customToast.success("File deleted successfully");
    },

    onError: (error: any, variables, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData(uploadKeys.all, context.previousFiles);
      }
      customToast.error(error.response?.data?.message || "Delete failed");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.all });
    },
  });
}

/**
 * Hook to update file
 */
export function useUpdateFile() {
  const queryClient = useQueryClient();

  return useMutation<UploadedFile, Error, UpdateFileInput>({
    mutationFn: ({ id, data }) => uploadApi.updateFile(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.all });
      queryClient.invalidateQueries({ queryKey: uploadKeys.detail(data._id) });
      customToast.success("File updated successfully");
    },

    onError: (error: any) => {
      customToast.error(error.response?.data?.message || "Update failed");
    },
  });
}
