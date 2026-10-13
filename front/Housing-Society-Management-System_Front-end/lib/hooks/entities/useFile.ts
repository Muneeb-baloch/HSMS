// src/lib/hooks/entities/useFile.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateFileDto,
  File,
  FileQueryParams,
  FileSummary,
  UpdateFileDto,
} from "@/lib/types/file";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "files";

export const useFiles = (params: FileQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, any> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        populate: "project,member,nominee,plot,application",
      };

      if (params.search) queryParams.search = params.search;
      if (params.fileRegNo) queryParams.fileRegNo = params.fileRegNo;
      if (params.fileBarCode) queryParams.fileBarCode = params.fileBarCode;
      if (params.projId) queryParams.projId = params.projId;
      if (params.planId) queryParams.planId = params.planId;
      if (params.memId) queryParams.memId = params.memId;
      if (params.nomineeId) queryParams.nomineeId = params.nomineeId;
      if (params.plotId) queryParams.plotId = params.plotId;
      if (params.status) queryParams.status = params.status;
      if (params.isAdjusted !== undefined)
        queryParams.isAdjusted = params.isAdjusted;
      if (params.isActive !== undefined) queryParams.isActive = params.isActive;
      if (params.minAmount !== undefined)
        queryParams.minAmount = params.minAmount;
      if (params.maxAmount !== undefined)
        queryParams.maxAmount = params.maxAmount;
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<{
        files: File[];
        pagination: PaginatedResponse<File>["pagination"];
      }>("/file", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.files,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch files");
    },
  });
};

export const useFile = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<File>(`/file/${id}`, {
        params: {
          populate: "project,member,nominee,plot,application",
        },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch file");
    },
    enabled: !!id,
  });
};

export const useFilesByMember = (memId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "member", memId],
    queryFn: async () => {
      const response = await apiClient.get<File[]>(`/file/member/${memId}`, {
        params: {
          populate: "project,member,nominee,plot,application",
        },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch files by member",
      );
    },
    enabled: !!memId,
  });
};

export const useFilesByPlan = (
  planId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "by-plan", planId, params],
    queryFn: async () => {
      const queryParams: Record<string, number> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;

      const response = await apiClient.get<{
        files: File[];
        total: number;
        pages: number;
      }>(`/file/by-plan/${planId}`, { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.files,
          total: response.data.data.total,
          pages: response.data.data.pages,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch files by plan"
      );
    },
    enabled: !!planId,
  });
};

export const useFilesByProject = (projId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "project", projId],
    queryFn: async () => {
      const response = await apiClient.get<File[]>(`/file/project/${projId}`, {
        params: {
          populate: "project,member,nominee,plot,application",
        },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch files by project",
      );
    },
    enabled: !!projId,
  });
};

export const useRecentFiles = (limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEY, "recent", limit],
    queryFn: async () => {
      const response = await apiClient.get<{
        files: File[];
      }>("/file", {
        params: { limit, sortBy: "bookingDate", sortOrder: "desc" },
      });

      if (response.data.success) {
        return response.data.data.files;
      }
      throw new Error(response.data.message || "Failed to fetch recent files");
    },
  });
};

export const useFileSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "summary"],
    queryFn: async () => {
      const response = await apiClient.get<FileSummary>(
        "/file/dashboard-summary",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch file summary");
    },
  });
};

export const useFileStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get<any>("/file/statistics");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch file statistics",
      );
    },
  });
};

export const useCreateFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFileDto & { societyId?: string }): Promise<File> => {
      const response = await apiClient.post<File>("/file", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create file");
    },
    onSuccess: () => {
      customToast.success("File created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create file");
    },
  });
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFileDto;
    }): Promise<File> => {
      const response = await apiClient.put<File>(`/file/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update file");
    },
    onSuccess: (data) => {
      customToast.success("File updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update file");
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/file/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete file");
      }
    },
    onSuccess: () => {
      customToast.success("File deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete file");
    },
  });
};
