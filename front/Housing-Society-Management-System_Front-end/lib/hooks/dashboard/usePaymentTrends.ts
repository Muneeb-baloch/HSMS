"use client";

import { apiClient } from "@/lib/API/client";
import { useQuery } from "@tanstack/react-query";

export interface PaymentTrendPoint {
  monthKey: string;
  month: string;
  monthShort: string;
  collected: number;
  due: number;
  total: number;
}

interface RawTrendPoint {
  monthKey: string;
  month: string;
  collected: number;
  due: number;
}

export function usePaymentTrends() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["payments", "trend"],
    queryFn: async () => {
      const response = await apiClient.get<RawTrendPoint[]>("/payment/trend", {
        params: { months: 12 },
      });
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch payment trends");
    },
  });

  const points: PaymentTrendPoint[] = (data ?? []).map((p) => ({
    monthKey: p.monthKey,
    month: p.month,
    monthShort: p.month.split(" ")[0],
    collected: p.collected,
    due: p.due,
    total: p.collected + p.due,
  }));

  return {
    data: points,
    isLoading,
    isError,
  };
}
