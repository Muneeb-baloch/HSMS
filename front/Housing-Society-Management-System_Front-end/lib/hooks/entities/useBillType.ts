import { billTypeApi } from "@/lib/API/billTypeApi";
import {
  BillType,
  BillTypeQueryParams,
  CreateBillTypeDto,
  UpdateBillTypeDto,
  BillTypeStatistics,
  CalculateAmountResult,
  ValidateConfigurationResult,
} from "@/lib/types/billType";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "billTypes";

export const useBillTypes = (params: BillTypeQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);
  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const response = await billTypeApi.getBillTypes(params);
      if (response.data.success) {
        return {
          items: response.data.data.billTypes,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch bill types");
    },
  });
};

export const useBillType = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await billTypeApi.getBillType(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch bill type");
    },
    enabled: !!id,
  });
};

export const useBillTypeStats = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await billTypeApi.getStatistics();
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch statistics");
    },
  });
};

export const useBillTypeDropdown = (category?: string, isRecurring?: boolean) => {
  return useQuery({
    queryKey: [QUERY_KEY, "dropdown", category, isRecurring],
    queryFn: async () => {
      const response = await billTypeApi.getDropdown(category, isRecurring);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch dropdown");
    },
  });
};

export const useCalculateAmount = () => {
  return useMutation({
    mutationFn: async ({
      billTypeId,
      units,
      baseAmount,
      applyTax,
    }: {
      billTypeId: string;
      units?: number;
      baseAmount?: number;
      applyTax?: boolean;
    }): Promise<CalculateAmountResult> => {
      const response = await billTypeApi.calculate(billTypeId, {
        units,
        baseAmount,
        applyTax,
      });
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to calculate");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to calculate");
    },
  });
};

export const useValidateBillType = () => {
  return useMutation({
    mutationFn: async (id: string): Promise<ValidateConfigurationResult> => {
      const response = await billTypeApi.validate(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to validate");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to validate");
    },
  });
};

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      billTypeIds,
      isActive,
    }: {
      billTypeIds: string[];
      isActive: boolean;
    }) => {
      const response = await billTypeApi.bulkUpdateStatus(billTypeIds, isActive);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update status");
    },
    onSuccess: (data) => {
      customToast.success(`Updated ${data.modified} bill types`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update status");
    },
  });
};

export const useCreateBillType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBillTypeDto): Promise<BillType> => {
      const response = await billTypeApi.create(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create bill type");
    },
    onSuccess: () => {
      customToast.success("Bill type created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create bill type");
    },
  });
};

export const useUpdateBillType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBillTypeDto;
    }): Promise<BillType> => {
      const response = await billTypeApi.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update bill type");
    },
    onSuccess: (data) => {
      customToast.success("Bill type updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update bill type");
    },
  });
};

export const useDeleteBillType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await billTypeApi.delete(id);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete bill type");
      }
    },
    onSuccess: () => {
      customToast.success("Bill type deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete bill type");
    },
  });
};
