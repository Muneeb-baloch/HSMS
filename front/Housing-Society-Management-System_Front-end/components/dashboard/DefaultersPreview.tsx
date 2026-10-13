"use client";

import { motion } from "framer-motion";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useDefaulters } from "@/lib/hooks/entities/useDefaulter";
import { useOverdueSummary } from "@/lib/hooks/entities/useDefaulter";
import { MiniListCard, MiniListEmpty } from "./MiniListCard";
import Link from "next/link";

function formatPKR(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return String(val);
}

export function DefaultersPreview() {
  const defaultersQuery = useDefaulters({
    page: 1,
    limit: 5,
    isActive: true,
    sortBy: "totalOverdueAmount",
    sortOrder: "desc",
  });
  const overdueSummary = useOverdueSummary();

  const defaulters = defaultersQuery.data?.items ?? [];
  const totalOverdue =
    (overdueSummary.data as { totalAmount?: number })?.totalAmount ??
    (defaulters as { totalOverdueAmount?: number }[]).reduce(
      (s, d) => s + (d.totalOverdueAmount ?? 0),
      0
    );
  const isLoading = defaultersQuery.isLoading;

  const getMemberName = (d: (typeof defaulters)[0]) => {
    const mem = d.memId;
    if (typeof mem === "object" && mem?.memName) return mem.memName;
    if (typeof mem === "object" && (mem as { fullName?: string })?.fullName)
      return (mem as { fullName: string }).fullName;
    return "—";
  };

  const getPlotNo = (d: (typeof defaulters)[0]) => {
    const plot = d.plotId;
    if (typeof plot === "object" && plot?.plotNo) return plot.plotNo;
    if (typeof plot === "object" && (plot as { plotBlockId?: { plotBlockName?: string } })?.plotBlockId)
      return (plot as { plotBlockId: { plotBlockName?: string } }).plotBlockId?.plotBlockName ?? "—";
    return "—";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="rounded-xl border border-amber-200/60 bg-white p-4 shadow-sm dark:border-amber-900/30 dark:bg-white/5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Defaulters
        </h3>
        <Link
          href="/defaulter"
          className="text-xs font-medium text-purple-600 hover:underline dark:text-indigo-400"
        >
          View All Defaulters →
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
          <IconAlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-amber-700 dark:text-amber-400">
            PKR {formatPKR(totalOverdue)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total overdue amount
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          Top 5 by amount
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : defaulters.length === 0 ? (
          <MiniListEmpty
            message="No defaulters"
            icon={<IconAlertTriangle className="size-5" />}
          />
        ) : (
          <ul className="space-y-1.5">
            {defaulters.map((d) => (
              <li key={d._id}>
                <Link
                  href={`/defaulter`}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-amber-50/50 dark:hover:bg-amber-900/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {getMemberName(d)}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      Plot {getPlotNo(d)} · {d.daysOverdue ?? 0}d overdue
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    PKR {formatPKR(d.totalOverdueAmount ?? 0)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
