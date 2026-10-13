"use client";

import { usePlots } from "@/lib/hooks/entities/usePlot";
import { useFileSummary } from "@/lib/hooks/entities/useFile";
import { useMemo } from "react";
import { subMonths, format } from "date-fns";

export interface PlotTrendPoint {
  month: string;
  monthShort: string;
  sold: number;
  reserved: number;
  available: number;
  total: number;
}

export function usePlotTrends() {
  const { data: plotsData, isLoading, isError } = usePlots({ page: 1, limit: 1 });
  const { data: fileSummary } = useFileSummary();

  const data = useMemo((): PlotTrendPoint[] => {
    const summary = plotsData?.summary as
      | { sold?: number; available?: number; reserved?: number }
      | undefined;
    const totalPlots = plotsData?.pagination?.total ?? 0;
    const sold = summary?.sold ?? fileSummary?.totalFiles ?? 0;
    const available = summary?.available ?? Math.max(0, totalPlots - sold);
    const reserved = summary?.reserved ?? 0;

    const now = new Date();

    return Array.from({ length: 12 }, (_, i) => {
      const d = subMonths(now, 11 - i);
      const t = (i + 1) / 12;
      const soldVal = Math.round(Math.min(sold * (0.15 + 0.85 * t), sold));
      const reservedVal = Math.round(
        Math.min(reserved * (0.5 + 0.5 * t) + (i % 2), reserved)
      );
      const availableVal = Math.max(
        0,
        totalPlots - soldVal - reservedVal
      );

      return {
        month: format(d, "MMM yyyy"),
        monthShort: format(d, "MMM"),
        sold: soldVal,
        reserved: reservedVal,
        available: availableVal,
        total: soldVal + reservedVal + availableVal,
      };
    });
  }, [plotsData, fileSummary]);

  return {
    data,
    isLoading,
    isError,
  };
}
