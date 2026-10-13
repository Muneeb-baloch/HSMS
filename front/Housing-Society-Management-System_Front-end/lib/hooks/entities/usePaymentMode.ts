// src/lib/hooks/entities/usePaymentMode.ts
import { paymentModeApi } from "@/lib/API/paymentModeApi";
import {
  CreatePaymentModeDto,
  GetPaymentModesResult,
  PaymentMode,
  PaymentModeQueryParams,
  PaymentModeSummary,
  UpdatePaymentModeDto,
} from "@/lib/types/paymentMode";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "paymentModes";

export const usePaymentModes = (params: PaymentModeQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async (): Promise<GetPaymentModesResult> => {
      const response = await paymentModeApi.getPaymentModes(params);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePaymentMode = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<PaymentMode> => {
      const response = await paymentModeApi.getPaymentModeById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const modesData = queryClient.getQueryData<GetPaymentModesResult>([
        QUERY_KEY,
        {},
      ]);
      return modesData?.paymentModes.find((m: PaymentMode) => m._id === id);
    },
  });
};

export const useCreatePaymentMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentModeDto): Promise<PaymentMode> => {
      const response = await paymentModeApi.createPaymentMode(data);
      return response.data.data;
    },
    onSuccess: () => {
      customToast.success("Payment mode created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create payment mode");
    },
  });
};

export const useUpdatePaymentMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePaymentModeDto;
    }): Promise<PaymentMode> => {
      const response = await paymentModeApi.updatePaymentMode(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      customToast.success("Payment mode updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update payment mode");
    },
  });
};

export const useDeletePaymentMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await paymentModeApi.deletePaymentMode(id);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete payment mode",
        );
      }
    },
    onSuccess: () => {
      customToast.success("Payment mode deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete payment mode");
    },
  });
};

export const useTogglePaymentModeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<PaymentMode> => {
      const response = await paymentModeApi.togglePaymentModeStatus(id);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      customToast.success("Payment mode status updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle payment mode status");
    },
  });
};

export const usePaymentModeSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "summary"],
    queryFn: async (): Promise<PaymentModeSummary> => {
      const response = await paymentModeApi.getPaymentModeSummary();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePaymentModesForDropdown = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "dropdown"],
    queryFn: async (): Promise<
      Array<{ id: string; name: string; description?: string }>
    > => {
      const response = await paymentModeApi.getPaymentModesForDropdown();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDefaultPaymentModes = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "defaults"],
    queryFn: async (): Promise<PaymentMode[]> => {
      const response = await paymentModeApi.getDefaultPaymentModes();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
