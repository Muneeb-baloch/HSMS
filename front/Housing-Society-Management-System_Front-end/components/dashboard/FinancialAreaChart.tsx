"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useBillDashboardSummary } from "@/lib/hooks/entities/useBillInfo";
import { useMemo } from "react";
import { AnimatedChartWrapper } from "./AnimatedChartWrapper";

const chartConfig = {
  paid: { label: "Paid", color: "var(--chart-2)" },
  pending: { label: "Pending", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function FinancialAreaChart() {
  const { data: billSummary } = useBillDashboardSummary();

  const chartData = useMemo(() => {
    const byMonth = billSummary?.statistics?.byMonth as Record<string, number> | undefined;
    if (!byMonth || typeof byMonth !== "object") return [];
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => {
        const val = Number(amount);
        return { month, paid: Math.round(val * 0.6), pending: Math.round(val * 0.4) };
      });
  }, [billSummary]);

  const displayData = chartData.length
    ? chartData
    : [
        { month: "Jan", paid: 0, pending: 0 },
        { month: "Feb", paid: 0, pending: 0 },
        { month: "Mar", paid: 0, pending: 0 },
      ];

  return (
    <AnimatedChartWrapper title="Financial Summary" description="Revenue vs pending over time" delay={200}>
      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="fillPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-paid)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-paid)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-pending)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-pending)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="paid" type="natural" fill="url(#fillPaid)" stroke="var(--color-paid)" />
            <Area dataKey="pending" type="natural" fill="url(#fillPending)" stroke="var(--color-pending)" />
          </AreaChart>
        </ChartContainer>
    </AnimatedChartWrapper>
  );
}
