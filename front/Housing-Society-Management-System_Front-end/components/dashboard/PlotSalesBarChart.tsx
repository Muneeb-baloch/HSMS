"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useFileSummary } from "@/lib/hooks/entities/useFile";
import { useMemo } from "react";
import { AnimatedChartWrapper } from "./AnimatedChartWrapper";

const chartConfig = {
  count: { label: "Files", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function PlotSalesBarChart() {
  const { data: fileSummary } = useFileSummary();

  const chartData = useMemo(() => {
    const byStatus = fileSummary?.filesByStatus;
    if (!Array.isArray(byStatus) || byStatus.length === 0) return [];
    return byStatus.slice(0, 8).map((s) => ({
      name: s.status,
      count: s.count ?? 0,
    }));
  }, [fileSummary]);

  const displayData = chartData.length
    ? chartData
    : [
        { name: "Active", count: 0 },
        { name: "Pending", count: 0 },
        { name: "Completed", count: 0 },
      ];

  return (
    <AnimatedChartWrapper title="Files by Status" description="Distribution of files by status" delay={160}>
      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
        <BarChart data={displayData} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted/50" />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
          <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[0, 8, 8, 0]} maxBarSize={32} />
        </BarChart>
      </ChartContainer>
    </AnimatedChartWrapper>
  );
}
