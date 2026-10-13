"use client";

import * as React from "react";
import { Scatter, ScatterChart, XAxis, YAxis, ZAxis, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDefaulters } from "@/lib/hooks/entities/useDefaulter";
import { useMemo } from "react";
import { AnimatedChartWrapper } from "./AnimatedChartWrapper";

const chartConfig = {
  amount: { label: "Amount Overdue", color: "var(--chart-5)" },
  days: { label: "Days Overdue", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function DefaultersScatterChart() {
  const { data, isLoading, isError } = useDefaulters({ limit: 30, page: 1 });

  const chartData = useMemo(() => {
    const items = data?.items ?? [];
    return items.map((d) => ({
      x: d.daysOverdue,
      y: d.totalOverdueAmount,
      z: 400,
      name: (d.memId as { memName?: string })?.memName ?? "Member",
    }));
  }, [data]);

  if (isError) {
    return (
      <AnimatedChartWrapper title="Defaulters Overview" description="Failed to load data" delay={240}>
        <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
          Unable to load defaulters.
        </div>
      </AnimatedChartWrapper>
    );
  }

  const displayData = chartData.length ? chartData : [{ x: 0, y: 0, z: 100, name: "No data" }];

  return (
    <AnimatedChartWrapper title="Defaulters Overview" description="Amount overdue vs days overdue" delay={240}>
      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full" aria-busy={isLoading}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" type="number" name="Days Overdue" unit=" days" tickLine={false} axisLine={false} />
            <YAxis dataKey="y" type="number" name="Amount" unit=" Rs" tickLine={false} axisLine={false} width={60} />
            <ZAxis type="number" dataKey="z" range={[100, 400]} />
            <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
            <Scatter data={displayData} fill="var(--color-amount)" />
          </ScatterChart>
        </ChartContainer>
    </AnimatedChartWrapper>
  );
}
