"use client";

import { useBillDashboardSummary } from "@/lib/hooks/entities/useBillInfo";
import { useMemo } from "react";
import { subMonths, format } from "date-fns";

export interface PaymentTrendPoint {
  month: string;
  monthShort: string;
  collected: number;
  due: number;
  total: number;
}

export function usePaymentTrends() {
  const { data: billSummary, isLoading, isError } = useBillDashboardSummary();

  const data = useMemo((): PaymentTrendPoint[] => {
    const byMonth = billSummary?.statistics?.byMonth as
      | Record<string, number>
      | undefined;
    const totalPaid = billSummary?.statistics?.totalPaid ?? 0;
    const totalPending = billSummary?.statistics?.totalPending ?? 0;
    const total = totalPaid + totalPending;
    const paidRatio = total > 0 ? totalPaid / total : 0.7;

    if (!byMonth || typeof byMonth !== "object" || Object.keys(byMonth).length === 0) {
      const now = new Date();
      return Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(now, 11 - i);
        const monthKey = format(d, "yyyy-MM");
        return {
          month: format(d, "MMM yyyy"),
          monthShort: format(d, "MMM"),
          collected: 0,
          due: 0,
          total: 0,
        };
      });
    }

    const entries = Object.entries(byMonth)
      .map(([monthKey, amount]) => {
        const val = Number(amount);
        const collected = Math.round(val * paidRatio);
        const due = Math.round(val * (1 - paidRatio));
        let d: Date;
        try {
          if (/^\d{4}-\d{2}$/.test(monthKey)) {
            d = new Date(monthKey + "-01");
          } else {
            d = new Date(monthKey);
          }
          if (isNaN(d.getTime())) d = new Date();
        } catch {
          d = new Date();
        }
        return {
          monthKey,
          month: format(d, "MMM yyyy"),
          monthShort: format(d, "MMM"),
          collected,
          due,
          total: val,
        };
      })
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-12);

    return entries;
  }, [billSummary]);

  return {
    data,
    isLoading,
    isError,
  };
}
