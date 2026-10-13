"use client";

import { SummaryCard } from "@/components/shared/SummaryCard";
import { useBillTypeStats } from "@/lib/hooks/entities/useBillType";
import { CheckCircle2, FileText, RefreshCw, XCircle } from "lucide-react";

export function BillTypeSummaryCards() {
  const { data: stats } = useBillTypeStats();

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Bill Types"
        value={stats.totalBillTypes ?? 0}
        icon={FileText}
        iconBgClassName="bg-blue-500/20"
        iconClassName="text-blue-400"
        gradient="from-blue-500/10 to-transparent"
      />
      <SummaryCard
        title="Active Bill Types"
        value={stats.activeCount ?? 0}
        icon={CheckCircle2}
        iconBgClassName="bg-emerald-500/20"
        iconClassName="text-emerald-400"
        valueClassName="text-emerald-400"
        gradient="from-emerald-500/10 to-transparent"
      />
      <SummaryCard
        title="Recurring Bill Types"
        value={stats.recurringCount ?? 0}
        icon={RefreshCw}
        iconBgClassName="bg-amber-500/20"
        iconClassName="text-amber-400"
        valueClassName="text-amber-400"
        gradient="from-amber-500/10 to-transparent"
      />
      <SummaryCard
        title="Inactive Bill Types"
        value={stats.inactiveCount ?? 0}
        icon={XCircle}
        iconBgClassName="bg-rose-500/20"
        iconClassName="text-rose-400"
        valueClassName="text-rose-400"
        gradient="from-rose-500/10 to-transparent"
      />
    </div>
  );
}
