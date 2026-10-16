// src/lib/hooks/entities/usePayment.ts
import { apiClient } from "@/lib/API/client";
import { Payment, ReceiptDetail } from "@/lib/types/payment";
import { useQuery } from "@tanstack/react-query";

const QUERY_KEY = "payments";

export const usePaymentsByFile = (fileId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "file", fileId],
    queryFn: async () => {
      const response = await apiClient.get<Payment[]>(`/payment/file/${fileId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch payments");
    },
    enabled: !!fileId,
  });
};

export const usePaymentsByTarget = (
  targetType: "installment" | "bill" | undefined,
  targetId: string | undefined
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "target", targetType, targetId],
    queryFn: async () => {
      const response = await apiClient.get<Payment[]>(
        `/payment/by-target/${targetType}/${targetId}`
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch receipts");
    },
    enabled: !!targetType && !!targetId,
  });
};

export const useReceipt = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<ReceiptDetail>(`/payment/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch receipt");
    },
    enabled: !!id,
  });
};
