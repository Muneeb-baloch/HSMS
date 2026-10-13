// src/lib/hooks/entities/useTransferType.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CommonTransferType,
  CreateTransferTypeDto,
  FeeCalculationResult,
  TransferType,
  TransferTypeDropdown,
  TransferTypeQueryParams,
  TransferTypeStatistics,
  TransferTypeSummary,
  UpdateTransferTypeDto,
} from "@/lib/types/transfer-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "transfer-types";

export const useTransferTypes = (params: TransferTypeQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, any> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };

      if (params.search) queryParams.search = params.search;
      if (params.isActive !== undefined) queryParams.isActive = params.isActive;
      if (params.minFee) queryParams.minFee = params.minFee;
      if (params.maxFee) queryParams.maxFee = params.maxFee;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<{
        transferTypes: TransferType[];
        pagination: PaginatedResponse<TransferType>["pagination"];
      }>("/transfertype", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.transferTypes,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch transfer types",
      );
    },
  });
};

export const useTransferType = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<TransferType>(`/transfertype/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch transfer type");
    },
    enabled: !!id,
  });
};

export const useActiveTransferTypes = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async () => {
      const response = await apiClient.get<TransferType[]>(
        "/transfertype/active",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch active transfer types",
      );
    },
  });
};

export const useTransferTypeDropdown = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "dropdown"],
    queryFn: async () => {
      const response = await apiClient.get<TransferTypeDropdown[]>(
        "/transfertype/dropdown",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch transfer types dropdown",
      );
    },
  });
};

export const useTransferTypeSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "summary"],
    queryFn: async () => {
      const response = await apiClient.get<TransferTypeSummary>(
        "/transfertype/summary",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch transfer type summary",
      );
    },
  });
};

export const useTransferTypeStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get<TransferTypeStatistics>(
        "/transfertype/statistics",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch transfer type statistics",
      );
    },
  });
};

export const useCommonTransferTypes = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "common"],
    queryFn: async () => {
      const response = await apiClient.get<CommonTransferType[]>(
        "/transfertype/common-types",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch common transfer types",
      );
    },
  });
};

export const useCalculateFee = (
  transferTypeId: string,
  options?: {
    propertyValue?: number;
    applyDiscount?: boolean;
    discountPercentage?: number;
  },
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "calculate-fee", transferTypeId, options],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (options?.propertyValue) params.propertyValue = options.propertyValue;
      if (options?.applyDiscount !== undefined)
        params.applyDiscount = options.applyDiscount;
      if (options?.discountPercentage)
        params.discountPercentage = options.discountPercentage;

      const response = await apiClient.get<FeeCalculationResult>(
        `/transfertype/${transferTypeId}/calculate-fee`,
        { params },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to calculate fee");
    },
    enabled: !!transferTypeId,
  });
};

export const useSearchTransferTypes = (
  searchTerm: string,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "search", searchTerm, limit],
    queryFn: async () => {
      const response = await apiClient.get<TransferType[]>(
        "/transfertype/search",
        {
          params: { q: searchTerm, limit },
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to search transfer types",
      );
    },
    enabled: searchTerm.length >= 2,
  });
};

export const useCreateTransferType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransferTypeDto): Promise<TransferType> => {
      const response = await apiClient.post<TransferType>(
        "/transfertype",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to create transfer type",
      );
    },
    onSuccess: () => {
      customToast.success("Transfer type created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "statistics"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "dropdown"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create transfer type");
    },
  });
};

export const useUpdateTransferType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransferTypeDto;
    }): Promise<TransferType> => {
      const response = await apiClient.put<TransferType>(
        `/transfertype/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to update transfer type",
      );
    },
    onSuccess: (data) => {
      customToast.success("Transfer type updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "statistics"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "dropdown"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update transfer type");
    },
  });
};

export const useDeleteTransferType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/transfertype/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete transfer type",
        );
      }
    },
    onSuccess: () => {
      customToast.success("Transfer type deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "statistics"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "dropdown"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete transfer type");
    },
  });
};

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transferTypeIds,
      isActive,
    }: {
      transferTypeIds: string[];
      isActive: boolean;
    }): Promise<{ matched: number; modified: number }> => {
      const response = await apiClient.post(
        "/transfertype/bulk/update-status",
        {
          transferTypeIds,
          isActive,
        },
      );

      if (response.data.success) {
        return response.data.data as { matched: number; modified: number };
      }
      throw new Error(
        response.data.message || "Failed to update transfer types status",
      );
    },
    onSuccess: () => {
      customToast.success("Transfer types updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "statistics"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "dropdown"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update transfer types status");
    },
  });
};

export const useUpdateFeesByPercentage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      percentage: number,
    ): Promise<{ updated: number; averageFee: number }> => {
      const response = await apiClient.post(
        "/transfertype/update-fees-percentage",
        {
          percentage,
        },
      );

      if (response.data.success) {
        return response.data.data as { updated: number; averageFee: number };
      }
      throw new Error(response.data.message || "Failed to update fees");
    },
    onSuccess: (data) => {
      customToast.success(`Fees updated for ${data.updated} transfer types`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "statistics"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "dropdown"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update fees");
    },
  });
};
