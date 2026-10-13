// src/lib/hooks/entities/useSalesStatus.ts
import { apiClient } from "@/lib/API/client";
import { ApiResponse, PaginatedResponse } from "@/lib/types/api";
import {
  BulkStatusUpdateDto,
  CreateSalesStatusDto,
  SalesStatus,
  SalesStatusQueryParams,
  SalesStatusStatistics,
  StatusOrder,
  UpdateSalesStatusDto,
  WorkflowValidationDto,
} from "@/lib/types/salesStatus";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "sales-statuses";

export const useSalesStatuses = (params: SalesStatusQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      // Convert arrays to comma-separated strings
      const queryParams: any = { ...params };

      if (params.statusType) {
        queryParams.statusType = params.statusType.join(",");
      }

      const response = await apiClient.get<{
        salesStatuses: SalesStatus[];
        summary: any;
        pagination: PaginatedResponse<SalesStatus>["pagination"];
      }>("/sales-status", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.salesStatuses,
          summary: response.data.data.summary,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch sales statuses",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSalesStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<SalesStatus>(`/sales-status/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch sales status");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const statusesData = queryClient.getQueryData<any>([QUERY_KEY, {}]);
      return statusesData?.items.find((s: SalesStatus) => s._id === id);
    },
  });
};

export const useSalesStatusByCode = (code: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "code", code],
    queryFn: async () => {
      const response = await apiClient.get<SalesStatus>(
        `/sales-status/code/${code}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch sales status");
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveSalesStatuses = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async () => {
      const response = await apiClient.get<SalesStatus[]>(
        "/sales-status/active",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch active statuses",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDefaultSalesStatus = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "default"],
    queryFn: async () => {
      const response = await apiClient.get<SalesStatus>(
        "/sales-status/default",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch default status",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSalesAllowedStatuses = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "sales-allowed"],
    queryFn: async () => {
      const response = await apiClient.get<SalesStatus[]>(
        "/sales-status/sales-allowed",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch sales allowed statuses",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useStatusesByType = (type: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "type", type],
    queryFn: async () => {
      const response = await apiClient.get<SalesStatus[]>(
        `/sales-status/type/${type}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch statuses by type",
      );
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSalesStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSalesStatusDto): Promise<SalesStatus> => {
      const response = await apiClient.post<SalesStatus>("/sales-status", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create sales status");
    },
    onSuccess: () => {
      customToast.success("Sales status created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create sales status");
    },
  });
};

export const useUpdateSalesStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSalesStatusDto;
    }): Promise<SalesStatus> => {
      const response = await apiClient.put<SalesStatus>(
        `/sales-status/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update sales status");
    },
    onSuccess: (_, variables) => {
      customToast.success("Sales status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update sales status");
    },
  });
};

export const useDeleteSalesStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/sales-status/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete sales status",
        );
      }
    },
    onSuccess: () => {
      customToast.success("Sales status deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete sales status");
    },
  });
};

export const useToggleStatusActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<SalesStatus> => {
      const response = await apiClient.patch<SalesStatus>(
        `/sales-status/${id}/toggle-active`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to toggle status");
    },
    onSuccess: (_, id) => {
      customToast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle status");
    },
  });
};

export const useUpdateStatusSequence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      sequence,
    }: {
      id: string;
      sequence: number;
    }): Promise<SalesStatus> => {
      const response = await apiClient.patch<SalesStatus>(
        `/sales-status/${id}/sequence`,
        { sequence },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update sequence");
    },
    onSuccess: (_, variables) => {
      customToast.success("Sequence updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update sequence");
    },
  });
};

export const useReorderStatuses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statusOrders: StatusOrder[]): Promise<boolean> => {
      const response = await apiClient.post<ApiResponse<boolean>>(
        "/sales-status/reorder",
        { statusOrders },
      );

      if (response.data.success) {
        return response.data.data as unknown as boolean; // <- must be the `data` property
      }

      throw new Error(response.data.message || "Failed to reorder statuses");
    },
    onSuccess: () => {
      customToast.success("Statuses reordered successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to reorder statuses");
    },
  });
};

export const useBulkUpdateStatuses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: BulkStatusUpdateDto,
    ): Promise<{ matched: number; modified: number }> => {
      const response = await apiClient.post<
        ApiResponse<{ matched: number; modified: number }>
      >("/sales-status/bulk-update", data);

      if (response.data.success) {
        return response.data.data as unknown as {
          matched: number;
          modified: number;
        };
      }
      throw new Error(response.data.message || "Failed to update statuses");
    },
    onSuccess: (data) => {
      customToast.success(`${data.modified} statuses updated successfully`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update statuses");
    },
  });
};

// src/lib/hooks/entities/useSalesStatus.ts (updated excerpt)
// Add these hooks to the existing file

export const useSalesStatusStatistics = () => {
  return useQuery<SalesStatusStatistics>({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get("/sales-status/stats/summary");
      if (response.data.success) {
        return response.data.data as SalesStatusStatistics;
      }
      throw new Error(response.data.message || "Failed to fetch statistics");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useStatusWorkflow = (statusId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, statusId, "workflow"],
    queryFn: async () => {
      const response = await apiClient.get(
        `/sales-status/${statusId}/workflow`,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch workflow");
    },
    enabled: !!statusId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useNextStatuses = (statusId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, statusId, "next-statuses"],
    queryFn: async () => {
      const response = await apiClient.get(
        `/sales-status/${statusId}/next-statuses`,
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch next statuses");
    },
    enabled: !!statusId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useValidateStatusTransition = () => {
  return useMutation({
    mutationFn: async (
      data: WorkflowValidationDto,
    ): Promise<{
      isValid: boolean;
      message?: string;
      allowedTransitions?: string[];
    }> => {
      const response = await apiClient.post<
        ApiResponse<{
          isValid: boolean;
          message?: string;
          allowedTransitions?: string[];
        }>
      >("/sales-status/validate-transition", data);

      if (response.data.success) {
        return response.data.data as unknown as {
          isValid: boolean;
          message?: string;
          allowedTransitions?: string[];
        };
      }
      throw new Error(response.data.message || "Failed to validate transition");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to validate transition");
    },
  });
};

export const useCheckSalesAllowed = (statusId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, statusId, "sales-allowed"],
    queryFn: async () => {
      const response = await apiClient.get<{ allowsSale: boolean }>(
        `/sales-status/${statusId}/check-sales-allowed`,
      );

      if (response.data.success) {
        return response.data.data.allowsSale;
      }
      throw new Error(response.data.message || "Failed to check sales allowed");
    },
    enabled: !!statusId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckRequiresApproval = (statusId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, statusId, "requires-approval"],
    queryFn: async () => {
      const response = await apiClient.get<{ requiresApproval: boolean }>(
        `/sales-status/${statusId}/check-requires-approval`,
      );

      if (response.data.success) {
        return response.data.data.requiresApproval;
      }
      throw new Error(
        response.data.message || "Failed to check requires approval",
      );
    },
    enabled: !!statusId,
    staleTime: 5 * 60 * 1000,
  });
};
