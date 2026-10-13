// lib/hooks/entities/usePaymentGateway.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "payment-gateway";

export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/payment-gateway/initiate", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to initiate payment");
    },
    onSuccess: () => {
      customToast.success("Payment initiated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to initiate payment");
    },
  });
};

export const useVerifyTransaction = (txnId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "verify", txnId],
    queryFn: async () => {
      const response = await apiClient.get(`/payment-gateway/verify/${txnId}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to verify transaction");
    },
    enabled: !!txnId,
    staleTime: 0,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usePaymentTransactions = (params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "transactions", queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get("/payment-gateway/transactions", { params: queryParams });
      if (response.data.success) {
        return {
          items: response.data.data.transactions ?? response.data.data,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch transactions");
    },
  });
};

export const usePaymentTransaction = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "transaction", id],
    queryFn: async () => {
      const response = await apiClient.get(`/payment-gateway/transactions/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch transaction");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRefundTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/payment-gateway/transactions/${id}/refund`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to refund transaction");
    },
    onSuccess: (_, variables) => {
      customToast.success("Transaction refunded successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "transaction", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to refund transaction");
    },
  });
};

export const usePaymentStats = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "stats", societyId],
    queryFn: async () => {
      const response = await apiClient.get(`/payment-gateway/stats`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch payment stats");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};
