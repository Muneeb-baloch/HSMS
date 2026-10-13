// src/lib/hooks/entities/useInstallment.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  BulkInstallmentCreationDto,
  BulkStatusUpdateDto,
  CreateInstallmentDto,
  Installment,
  InstallmentDashboardSummary,
  InstallmentQueryParams,
  InstallmentReport,
  InstallmentReportParams,
  InstallmentSummary,
  PaymentValidation,
  RecordPaymentDto,
  UpdateInstallmentDto,
} from "@/lib/types/installment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "installments";

export const useInstallments = (params: InstallmentQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, any> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };

      if (params.fileId) queryParams.fileId = params.fileId;
      if (params.memId) queryParams.memId = params.memId;
      if (params.plotId) queryParams.plotId = params.plotId;
      if (params.installmentCategoryId)
        queryParams.installmentCategoryId = params.installmentCategoryId;
      if (params.status) queryParams.status = params.status;
      if (params.installmentType)
        queryParams.installmentType = params.installmentType;
      if (params.paymentMode) queryParams.paymentMode = params.paymentMode;
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      if (params.overdue !== undefined) queryParams.overdue = params.overdue;
      if (params.search) queryParams.search = params.search;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<{
        installments: Installment[];
        pagination: PaginatedResponse<Installment>["pagination"];
      }>("/installment", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.installments,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch installments");
    },
  });
};

export const useInstallment = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Installment>(`/installment/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch installment");
    },
    enabled: !!id,
  });
};

export const useInstallmentsByFile = (fileId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "file", fileId],
    queryFn: async () => {
      const response = await apiClient.get<Installment[]>(
        `/installment/file/${fileId}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch file installments",
      );
    },
    enabled: !!fileId,
  });
};

export const useInstallmentsByMember = (memId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "member", memId],
    queryFn: async () => {
      const response = await apiClient.get<Installment[]>(
        `/installment/member/${memId}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch member installments",
      );
    },
    enabled: !!memId,
  });
};

export const useInstallmentsByPlot = (plotId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "plot", plotId],
    queryFn: async () => {
      const response = await apiClient.get<Installment[]>(
        `/installment/plot/${plotId}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch plot installments",
      );
    },
    enabled: !!plotId,
  });
};

export const useOverdueInstallments = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "overdue"],
    queryFn: async () => {
      const response = await apiClient.get<Installment[]>(
        "/installment/overdue",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch overdue installments",
      );
    },
  });
};

export const useDueTodayInstallments = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "due-today"],
    queryFn: async () => {
      const response = await apiClient.get<Installment[]>(
        "/installment/due-today",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch due today installments",
      );
    },
  });
};

export const useInstallmentSummary = (memId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "summary", memId],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentSummary>(
        `/installment/member/${memId}/summary`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch installment summary",
      );
    },
    enabled: !!memId,
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentDashboardSummary>(
        "/installment/dashboard-summary",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch dashboard summary",
      );
    },
  });
};

export const useNextDueInstallment = (memId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "next-due", memId],
    queryFn: async () => {
      const response = await apiClient.get<Installment>(
        `/installment/member/${memId}/next-due`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch next due installment",
      );
    },
    enabled: !!memId,
  });
};

export const useSearchInstallments = (
  searchTerm: string,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "search", searchTerm],
    queryFn: async () => {
      const response = await apiClient.get<Installment[]>(
        "/installment/search",
        {
          params: { q: searchTerm, limit },
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to search installments");
    },
    enabled: searchTerm.length >= 2,
  });
};

export const useGenerateReport = (params: InstallmentReportParams) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "report", queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, any> = {
        startDate: params.startDate,
        endDate: params.endDate,
      };

      if (params.fileId) queryParams.fileId = params.fileId;
      if (params.memId) queryParams.memId = params.memId;
      if (params.plotId) queryParams.plotId = params.plotId;
      if (params.installmentCategoryId)
        queryParams.installmentCategoryId = params.installmentCategoryId;
      if (params.status) queryParams.status = params.status;
      if (params.installmentType)
        queryParams.installmentType = params.installmentType;

      const response = await apiClient.get<InstallmentReport>(
        "/installment/report",
        {
          params: queryParams,
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to generate report");
    },
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useCreateInstallment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInstallmentDto): Promise<Installment> => {
      const response = await apiClient.post<Installment>("/installment", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create installment");
    },
    onSuccess: () => {
      customToast.success("Installment created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create installment");
    },
  });
};

export const useCreateBulkInstallments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: BulkInstallmentCreationDto,
    ): Promise<Installment[]> => {
      const response = await apiClient.post<Installment[]>(
        "/installment/bulk",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to create bulk installments",
      );
    },
    onSuccess: (data) => {
      customToast.success(`Successfully created ${data.length} installments`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create bulk installments");
    },
  });
};

export const useUpdateInstallment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInstallmentDto;
    }): Promise<Installment> => {
      const response = await apiClient.put<Installment>(
        `/installment/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update installment");
    },
    onSuccess: (_, variables) => {
      customToast.success("Installment updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update installment");
    },
  });
};

export const useDeleteInstallment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/installment/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete installment",
        );
      }
    },
    onSuccess: () => {
      customToast.success("Installment deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete installment");
    },
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: RecordPaymentDto;
    }): Promise<Installment> => {
      const response = await apiClient.post<Installment>(
        `/installment/${id}/payment`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to record payment");
    },
    onSuccess: (_, variables) => {
      customToast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to record payment");
    },
  });
};

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: BulkStatusUpdateDto,
    ): Promise<{ matched: number; modified: number }> => {
      const response = await apiClient.post<any>(
        "/installment/bulk/update-status",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update status");
    },
    onSuccess: (data) => {
      customToast.success(`Status updated for ${data.modified} installments`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update status");
    },
  });
};

export const useValidatePayment = (id: string, amount: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, "validate", id, amount],
    queryFn: async () => {
      const response = await apiClient.get<PaymentValidation>(
        `/installment/${id}/validate-payment`,
        {
          params: { amount },
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to validate payment");
    },
    enabled: !!id && !!amount,
  });
};

export const useToggleInstallmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }): Promise<Installment> => {
      const response = await apiClient.put<Installment>(`/installment/${id}`, {
        status,
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update status");
    },
    onSuccess: (_, variables) => {
      customToast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update status");
    },
  });
};
