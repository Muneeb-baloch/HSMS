"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePlotTrends } from "@/lib/hooks/dashboard/usePlotTrends";
import { ChartCard } from "./ChartCard";

export function PlotSalesChart() {
  const { data, isLoading, isError } = usePlotTrends();

  const isEmpty =
    data.length === 0 ||
    data.every((d) => d.sold === 0 && d.reserved === 0 && d.available === 0);

  if (isError) {
    return (
      <ChartCard
        title="Plot Sales Progress"
        description="Sold, Reserved & Available over time"
        isEmpty={false}
        isLoading={false}
      >
        <div className="flex h-full items-center justify-center text-sm text-red-600">
          Failed to load plot trends.
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Plot Sales Progress"
      description="Sold vs Reserved vs Available plots"
      isLoading={isLoading}
      isEmpty={isEmpty}
      delay={150}
    >
      {!isEmpty && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillSold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.75} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.15} />
              </linearGradient>
              <linearGradient id="fillReserved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.12} />
              </linearGradient>
              <linearGradient id="fillAvailable" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="monthShort"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload;
                if (!p) return null;
                return (
                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {p.month}
                    </p>
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-xs">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Sold: {p.sold}
                      </p>
                      <p className="flex items-center gap-2 text-xs">
                        <span className="size-2 rounded-full bg-amber-500" />
                        Reserved: {p.reserved}
                      </p>
                      <p className="flex items-center gap-2 text-xs">
                        <span className="size-2 rounded-full bg-slate-500" />
                        Available: {p.available}
                      </p>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="sold"
              name="Sold"
              stackId="1"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#fillSold)"
            />
            <Area
              type="monotone"
              dataKey="reserved"
              name="Reserved"
              stackId="1"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#fillReserved)"
            />
            <Area
              type="monotone"
              dataKey="available"
              name="Available"
              stackId="1"
              stroke="#64748b"
              strokeWidth={2}
              fill="url(#fillAvailable)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
