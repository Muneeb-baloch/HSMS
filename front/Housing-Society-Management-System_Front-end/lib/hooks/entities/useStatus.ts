// src/lib/hooks/entities/useStatus.ts
"use client";

import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateStatusDto,
  Status,
  StatusQueryParams,
  UpdateStatusDto,
} from "@/lib/types/status";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

export const useStatuses = (params: StatusQueryParams = {}) => {
  return useQuery({
    queryKey: ["status", params],
    queryFn: async () => {
      const response = await apiClient.get<{
        statuses: Status[];
        pagination: PaginatedResponse<Status>["pagination"];
      }>("/status", { params });

      if (response.data.success) {
        return {
          items: response.data.data.statuses,
          pagination: response.data.data.pagination,
        } as PaginatedResponse<Status>;
      }
      throw new Error(response.data.message || "Failed to fetch status");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["status", id],
    queryFn: async () => {
      const response = await apiClient.get<Status>(`/status/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch status");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const statusData = queryClient.getQueryData<PaginatedResponse<Status>>([
        "status",
        {},
      ]);
      return statusData?.items.find((s) => s._id === id);
    },
  });
};

export const useCreateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStatusDto): Promise<Status> => {
      const response = await apiClient.post<Status>("/status", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create status");
    },
    onSuccess: () => {
      customToast.success("Status created successfully");
      queryClient.invalidateQueries({ queryKey: ["status"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create status");
    },
  });
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStatusDto;
    }): Promise<Status> => {
      const response = await apiClient.put<Status>(`/status/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update status");
    },
    onSuccess: () => {
      customToast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["status"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update status");
    },
  });
};

export const useDeleteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/status/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete status");
      }
    },
    onSuccess: () => {
      customToast.success("Status deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["status"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete status");
    },
  });
};
