import { billInfoApi } from "@/lib/API/billInfoApi";
import {
  BillInfo,
  BillInfoQueryParams,
  CreateBillInfoDto,
  UpdateBillInfoDto,
  RecordPaymentDto,
  GenerateBillsDto,
} from "@/lib/types/billInfo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "bills";

export const useBills = (params: BillInfoQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);
  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const response = await billInfoApi.getBills(params);
      if (response.data.success) {
        return {
          items: response.data.data.bills,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch bills");
    },
  });
};

export const useBill = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await billInfoApi.getBill(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch bill");
    },
    enabled: !!id,
  });
};

export const useBillStats = (year?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics", year],
    queryFn: async () => {
      const response = await billInfoApi.getStatistics(year);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch statistics");
    },
  });
};

export const useBillDashboardSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "dashboard-summary"],
    queryFn: async () => {
      const response = await billInfoApi.getDashboardSummary();
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch dashboard summary");
    },
  });
};

export const useOverdueBills = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [QUERY_KEY, "overdue", page, limit],
    queryFn: async () => {
      const response = await billInfoApi.getOverdue(page, limit);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch overdue bills");
    },
  });
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBillInfoDto): Promise<BillInfo> => {
      const response = await billInfoApi.create(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create bill");
    },
    onSuccess: () => {
      customToast.success("Bill created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create bill");
    },
  });
};

export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBillInfoDto;
    }): Promise<BillInfo> => {
      const response = await billInfoApi.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update bill");
    },
    onSuccess: (data) => {
      customToast.success("Bill updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update bill");
    },
  });
};

export const useDeleteBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await billInfoApi.delete(id);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete bill");
      }
    },
    onSuccess: () => {
      customToast.success("Bill deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete bill");
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
    }): Promise<BillInfo> => {
      const response = await billInfoApi.recordPayment(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to record payment");
    },
    onSuccess: (data) => {
      customToast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to record payment");
    },
  });
};

export const useGenerateBills = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GenerateBillsDto) => {
      const response = await billInfoApi.generate(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to generate bills");
    },
    onSuccess: (data) => {
      customToast.success(`Generated ${data.success} bills, ${data.failed} failed`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to generate bills");
    },
  });
};
