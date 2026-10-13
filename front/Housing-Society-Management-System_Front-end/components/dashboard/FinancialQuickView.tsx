"use client";

import { motion } from "framer-motion";
import { IconReceipt, IconCash } from "@tabler/icons-react";
import { useBillDashboardSummary } from "@/lib/hooks/entities/useBillInfo";
import { useDashboardSummary as useInstallmentDashboardSummary } from "@/lib/hooks/entities/useInstallment";
import { MiniListEmpty } from "./MiniListCard";
import Link from "next/link";

function formatPKR(val: number): string {
  if (val >= 1_000_000) return `PKR ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `PKR ${(val / 1_000).toFixed(1)}K`;
  return `PKR ${val.toLocaleString()}`;
}

export function FinancialQuickView() {
  const billSummary = useBillDashboardSummary();
  const installmentSummary = useInstallmentDashboardSummary();

  const pendingBills = billSummary.data?.statistics?.totalPending ?? 0;
  const totalPayable = billSummary.data?.statistics?.totalAmount ?? 0;
  const totalPendingAmount =
    (billSummary.data?.statistics as { totalPendingAmount?: number })
      ?.totalPendingAmount ?? pendingBills * 0; // API might not expose
  const recentPayments = installmentSummary.data?.recentPayments ?? [];
  const upcomingDue = installmentSummary.data?.upcomingDue ?? [];
  const isLoading = billSummary.isLoading || installmentSummary.isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.35 }}
      className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Financial Summary
        </h3>
        <Link
          href="/billinfo"
          className="text-xs font-medium text-purple-600 hover:underline dark:text-indigo-400"
        >
          View Bills →
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <IconReceipt className="size-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
            {pendingBills} pending
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {upcomingDue.length > 0
              ? `${upcomingDue.length} installments due soon`
              : "Bills & installments"}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          Recent Payments
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : recentPayments.length === 0 ? (
          <MiniListEmpty
            message="No recent payments"
            icon={<IconCash className="size-5" />}
          />
        ) : (
          <ul className="space-y-1.5">
            {(recentPayments as Array<{ _id: string; amountPaid?: number; paidDate?: string }>)
              .slice(0, 4)
              .map((p) => (
                <li key={p._id}>
                  <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatPKR(p.amountPaid ?? 0)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {p.paidDate
                        ? new Date(p.paidDate).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
