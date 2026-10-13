// src/lib/hooks/entities/useSrDevStatus.ts
import {
  WorkflowPhase,
  WorkflowResponse,
} from "@/app/(protected)/sr-dev-status/workflow/page";
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  BulkStatusUpdateDto,
  CreateSrDevStatusDto,
  DevCategory,
  DevPhase,
  ProgressReport,
  SrDevStatus,
  SrDevStatusQueryParams,
  StatusOrder,
  StatusTransitionDto,
  UpdateSrDevStatusDto,
} from "@/lib/types/srdevstatus";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "sr-dev-statuses";

export const useSrDevStatuses = (params: SrDevStatusQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      // Convert arrays to comma-separated strings
      const queryParams: any = { ...params };

      if (params.devCategory) {
        queryParams.devCategory = params.devCategory.join(",");
      }

      if (params.devPhase) {
        queryParams.devPhase = params.devPhase.join(",");
      }

      const response = await apiClient.get<{
        srDevStatuses: SrDevStatus[];
        summary: any;
        pagination: PaginatedResponse<SrDevStatus>["pagination"];
      }>("/sr-dev-status", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.srDevStatuses,
          summary: response.data.data.summary,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch development statuses",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSrDevStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<SrDevStatus>(`/sr-dev-status/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch development status",
      );
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const statusesData = queryClient.getQueryData<any>([QUERY_KEY, {}]);
      return statusesData?.items.find((s: SrDevStatus) => s._id === id);
    },
  });
};

export const useSrDevStatusByCode = (code: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "code", code],
    queryFn: async () => {
      const response = await apiClient.get<SrDevStatus>(
        `/sr-dev-status/code/${code}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch development status",
      );
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveSrDevStatuses = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async () => {
      const response = await apiClient.get<SrDevStatus[]>(
        "/sr-dev-status/active",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch active development statuses",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDefaultSrDevStatus = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "default"],
    queryFn: async () => {
      const response = await apiClient.get<SrDevStatus>(
        "/sr-dev-status/default",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch default development status",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useStatusesByCategory = (category: DevCategory) => {
  return useQuery({
    queryKey: [QUERY_KEY, "category", category],
    queryFn: async () => {
      const response = await apiClient.get<SrDevStatus[]>(
        `/sr-dev-status/category/${category}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch statuses by category",
      );
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStatusesByPhase = (phase: DevPhase) => {
  return useQuery({
    queryKey: [QUERY_KEY, "phase", phase],
    queryFn: async () => {
      const response = await apiClient.get<SrDevStatus[]>(
        `/sr-dev-status/phase/${phase}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch statuses by phase",
      );
    },
    enabled: !!phase,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSrDevStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSrDevStatusDto): Promise<SrDevStatus> => {
      const response = await apiClient.post<SrDevStatus>(
        "/sr-dev-status",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to create development status",
      );
    },
    onSuccess: () => {
      customToast.success("Development status created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create development status");
    },
  });
};

export const useUpdateSrDevStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSrDevStatusDto;
    }): Promise<SrDevStatus> => {
      const response = await apiClient.put<SrDevStatus>(
        `/sr-dev-status/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to update development status",
      );
    },
    onSuccess: (_, variables) => {
      customToast.success("Development status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update development status");
    },
  });
};

export const useDeleteSrDevStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/sr-dev-status/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete development status",
        );
      }
    },
    onSuccess: () => {
      customToast.success("Development status deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete development status");
    },
  });
};

export const useToggleStatusActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<SrDevStatus> => {
      const response = await apiClient.patch<SrDevStatus>(
        `/sr-dev-status/${id}/toggle-active`,
        {}, // empty body
        { headers: { "Content-Type": "application/json" } },
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
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message;
      if (message.includes("default development status")) {
        customToast.warning("Default status cannot be deactivated");
      } else {
        customToast.error(message);
      }
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
    }): Promise<SrDevStatus> => {
      const response = await apiClient.patch<SrDevStatus>(
        `/sr-dev-status/${id}/sequence`,
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
      const response = await apiClient.post("/sr-dev-status/reorder", {
        statusOrders,
      });

      if (response.data.success) {
        return response.data.data as unknown as boolean;
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
      const response = await apiClient.post("/sr-dev-status/bulk-update", data);

      if (response.data.success) {
        return response.data.data as { matched: number; modified: number };
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

export const useSrDevStatusStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get("/sr-dev-status/stats/summary");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch statistics");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDevelopmentWorkflow = () => {
  return useQuery<WorkflowPhase[], Error>({
    queryKey: ["sr-dev-status", "workflow"],
    queryFn: async (): Promise<WorkflowPhase[]> => {
      const response = await apiClient.get<WorkflowResponse>(
        "/sr-dev-status/workflow",
      );

      if (response.data.success) {
        return response.data.data as unknown as WorkflowPhase[]; // this is now definitely WorkflowPhase[]
      }

      throw new Error(response.data.message || "Failed to fetch workflow");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useNextLogicalStatuses = (statusId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, statusId, "next-statuses"],
    queryFn: async () => {
      const response = await apiClient.get<SrDevStatus[]>(
        `/sr-dev-status/${statusId}/next-statuses`,
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
      data: StatusTransitionDto,
    ): Promise<{
      isValid: boolean;
      message?: string;
      validationRules?: any[];
      estimatedDays?: number;
    }> => {
      const response = await apiClient.post(
        "/sr-dev-status/validate-transition",
        data,
      );

      if (response.data.success) {
        return response.data.data as unknown as {
          isValid: boolean;
          message?: string;
          validationRules?: any[];
          estimatedDays?: number;
        };
      }
      throw new Error(response.data.message || "Failed to validate transition");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to validate transition");
    },
  });
};

export const useCalculateProjectProgress = () => {
  return useMutation({
    mutationFn: async (data: {
      statusIds: string[];
    }): Promise<ProgressReport> => {
      const response = await apiClient.post(
        "/sr-dev-status/calculate-progress",
        data,
      );

      if (response.data.success) {
        return response.data.data as ProgressReport;
      }
      throw new Error(response.data.message || "Failed to calculate progress");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to calculate progress");
    },
  });
};

export const useDevelopmentPhasesProgress = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "phases-progress"],
    queryFn: async () => {
      const response = await apiClient.get("/sr-dev-status/phases-progress");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch phases progress",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckRequiresDocumentation = (statusId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, statusId, "requires-documentation"],
    queryFn: async () => {
      const response = await apiClient.get<{ requiresDocumentation: boolean }>(
        `/sr-dev-status/${statusId}/check-documentation`,
      );

      if (response.data.success) {
        return response.data.data.requiresDocumentation;
      }
      throw new Error(
        response.data.message || "Failed to check documentation requirement",
      );
    },
    enabled: !!statusId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEstimatedCompletion = (statusId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, statusId, "estimated-completion"],
    queryFn: async () => {
      const response = await apiClient.get(
        `/sr-dev-status/${statusId}/estimated-completion`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch estimated completion",
      );
    },
    enabled: !!statusId,
    staleTime: 5 * 60 * 1000,
  });
};
