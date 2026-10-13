import { apiClient } from "@/lib/API/client";
import { ApiError, ApiResponse, PaginatedResponse } from "@/lib/types/api";
import {
  CreateTransferDto,
  ExecuteTransferDto,
  RecordFeePaymentDto,
  Transfer,
  TransferQueryParams,
  UpdateTransferDto,
} from "@/lib/types/transfer.types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

export const transferKeys = {
  all: ["transfers"] as const,
  lists: () => [...transferKeys.all, "list"] as const,
  list: (filters: TransferQueryParams) =>
    [...transferKeys.lists(), filters] as const,
  details: () => [...transferKeys.all, "detail"] as const,
  detail: (id: string) => [...transferKeys.details(), id] as const,
  statistics: () => [...transferKeys.all, "statistics"] as const,
  dashboard: () => [...transferKeys.all, "dashboard"] as const,
  pending: () => [...transferKeys.all, "pending"] as const,
  overdue: () => [...transferKeys.all, "overdue"] as const,
  byFile: (fileId: string) => [...transferKeys.all, "byFile", fileId] as const,
  byMember: (memId: string) =>
    [...transferKeys.all, "byMember", memId] as const,
};

export function useTransfers(
  params: TransferQueryParams = {},
): UseQueryResult<PaginatedResponse<Transfer>, unknown> {
  return useQuery<
    PaginatedResponse<Transfer>,
    unknown,
    PaginatedResponse<Transfer>
  >({
    queryKey: transferKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ transfers: Transfer[]; pagination: { page: number; limit: number; total: number; pages: number } }>
      >("/transfer", { params });
      const { transfers, pagination } = response.data.data;
      return { items: transfers ?? [], pagination };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTransferById(id: string) {
  return useQuery<Transfer, unknown, Transfer>({
    queryKey: transferKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Transfer>>(
        `/transfer/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation<Transfer, ApiError, CreateTransferDto>({
    mutationFn: async (data: CreateTransferDto) => {
      const response = await apiClient.post<ApiResponse<Transfer>>(
        "/transfer",
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      customToast.success("Transfer created successfully");
    },
    onError: (error) => {
      customToast.error(error.response?.data?.message || "Failed to create transfer");
    },
  });
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransferDto;
    }) => {
      const response = await apiClient.put<ApiResponse<Transfer>>(
        `/transfer/${id}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: transferKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      customToast.success("Transfer updated successfully");
    },
    onError: (error: any) => {
      customToast.error(error.response?.data?.message || "Failed to update transfer");
    },
  });
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/transfer/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      customToast.success("Transfer deleted successfully");
    },
    onError: (error: any) => {
      customToast.error(error.response?.data?.message || "Failed to delete transfer");
    },
  });
}

export function useRecordFeePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: RecordFeePaymentDto;
    }) => {
      const response = await apiClient.post<ApiResponse<Transfer>>(
        `/transfer/${id}/pay-fee`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: transferKeys.detail(variables.id),
      });
      customToast.success("Fee payment recorded successfully");
    },
    onError: (error: any) => {
      customToast.error(
        error.response?.data?.message || "Failed to record fee payment",
      );
    },
  });
}

export function useExecuteTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ExecuteTransferDto;
    }) => {
      const response = await apiClient.post<ApiResponse<Transfer>>(
        `/transfer/${id}/execute`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: transferKeys.detail(variables.id),
      });
      customToast.success("Transfer executed successfully");
    },
    onError: (error: any) => {
      customToast.error(
        error.response?.data?.message || "Failed to execute transfer",
      );
    },
  });
}

export function useTransferStatistics() {
  return useQuery({
    queryKey: transferKeys.statistics(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(
        "/transfer/statistics",
      );
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: transferKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(
        "/transfer/dashboard-summary",
      );
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePendingTransfers(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: transferKeys.pending(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(
        "/transfer/pending",
        { params: { page, limit } },
      );
      return response.data.data;
    },
  });
}

export function useTransfersByFile(fileId: string) {
  return useQuery({
    queryKey: transferKeys.byFile(fileId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Transfer[]>>(
        `/transfer/file/${fileId}`,
      );
      return response.data.data;
    },
    enabled: !!fileId,
  });
}

export function useTransfersByMember(memId: string) {
  return useQuery({
    queryKey: transferKeys.byMember(memId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Transfer[]>>(
        `/transfer/member/${memId}`,
      );
      return response.data.data;
    },
    enabled: !!memId,
  });
}
