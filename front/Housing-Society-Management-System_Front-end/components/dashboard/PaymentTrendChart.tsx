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
import { usePaymentTrends } from "@/lib/hooks/dashboard/usePaymentTrends";
import { ChartCard } from "./ChartCard";

function formatPKR(value: number): string {
  if (value >= 1_000_000) return `PKR ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `PKR ${(value / 1_000).toFixed(1)}K`;
  return `PKR ${value.toLocaleString()}`;
}

export function PaymentTrendChart() {
  const { data, isLoading, isError } = usePaymentTrends();

  const isEmpty = data.length === 0 || data.every((d) => d.collected === 0 && d.due === 0);

  if (isError) {
    return (
      <ChartCard
        title="Payment / Installment Trend"
        description="Collected vs Due amount by month"
        isEmpty={false}
        isLoading={false}
      >
        <div className="flex h-full items-center justify-center text-sm text-red-600">
          Failed to load payment trends.
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Payment / Installment Trend"
      description="Collected vs Due amount by month (PKR)"
      isLoading={isLoading}
      isEmpty={isEmpty}
      delay={100}
    >
      {!isEmpty && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillDue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
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
              tickFormatter={(v) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v)
              }
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
                        <span className="size-2 rounded-full bg-teal-500" />
                        Collected: {formatPKR(p.collected)}
                      </p>
                      <p className="flex items-center gap-2 text-xs">
                        <span className="size-2 rounded-full bg-indigo-500" />
                        Due: {formatPKR(p.due)}
                      </p>
                      <p className="mt-1 border-t border-gray-100 pt-1 text-xs font-medium dark:border-gray-800">
                        Diff: {formatPKR(p.collected - p.due)}
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
              dataKey="collected"
              name="Collected Amount"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#fillCollected)"
            />
            <Area
              type="monotone"
              dataKey="due"
              name="Due Amount"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#fillDue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
