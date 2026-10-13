"use client";

import * as React from "react";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePlots } from "@/lib/hooks/entities/usePlot";
import { useMemo } from "react";
import { AnimatedChartWrapper } from "./AnimatedChartWrapper";

const chartConfig = {
  available: { label: "Available", color: "var(--chart-2)" },
  sold: { label: "Sold", color: "var(--chart-1)" },
  transfer: { label: "Under Transfer", color: "var(--chart-4)" },
} satisfies ChartConfig;

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)"];

export function PlotStatusPieChart() {
  const { data: plotsData, isLoading, isError } = usePlots({ page: 1, limit: 1 });

  const chartData = useMemo(() => {
    const summary = plotsData?.summary as { available?: number; sold?: number; [k: string]: unknown } | undefined;
    const total = plotsData?.pagination?.total ?? 0;
    const available = summary?.available ?? 0;
    const sold = summary?.sold ?? Math.max(0, total - available);
    const transfer = Math.max(0, total - available - sold);

    return [
      { name: "available", value: available, fill: "var(--chart-2)" },
      { name: "sold", value: sold, fill: "var(--chart-1)" },
      ...(transfer > 0 ? [{ name: "transfer", value: transfer, fill: "var(--chart-4)" }] : []),
    ].filter((d) => d.value > 0);
  }, [plotsData]);

  if (isError) {
    return (
      <AnimatedChartWrapper title="Plot Status" description="Failed to load data" delay={100}>
        <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
          Unable to load plot status.
        </div>
      </AnimatedChartWrapper>
    );
  }

  const displayData = chartData.length ? chartData : [{ name: "empty", value: 1, fill: "var(--muted)" }];

  return (
    <AnimatedChartWrapper title="Plot Status" description="Distribution by availability" delay={120}>
      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full" aria-busy={isLoading}>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideIndicator />} />
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, value }) =>
                value > 0 && name !== "empty"
                  ? `${(chartConfig as Record<string, { label?: string }>)[name]?.label ?? name}: ${value}`
                  : null
              }
            >
              {displayData.map((_, i) => (
                <Cell key={i} fill={displayData[i].fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
    </AnimatedChartWrapper>
  );
}
