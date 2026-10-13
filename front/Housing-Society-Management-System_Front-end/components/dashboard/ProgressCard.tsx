"use client";

import type { TablerIcon } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  subtext?: string;
  value: number;
  /** Optional max for display (e.g. "5/20"). If omitted, shows value only. */
  max?: number;
  progressPercent: number;
  barColor: "green" | "purple" | "red";
  icon?: TablerIcon;
  delay?: number;
  /** Optional suffix (e.g. "%" or ""). */
  valueSuffix?: string;
}

const BAR_COLORS = {
  green: "bg-teal-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
};

export function ProgressCard({
  title,
  subtext,
  value,
  max,
  progressPercent,
  barColor,
  icon: Icon,
  delay = 0,
  valueSuffix = "",
}: ProgressCardProps) {
  const percent = Math.min(100, Math.max(0, progressPercent));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm",
        "transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <Icon className="size-4" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtext && (
            <p className="text-xs text-gray-500">{subtext}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6, delay: (delay + 100) / 1000 }}
            className={cn("h-full rounded-full", BAR_COLORS[barColor])}
          />
        </div>
        <span className="text-sm font-bold tabular-nums text-gray-900">
          {max != null ? `${value}/${max}` : `${value}${valueSuffix || ""}`}
        </span>
      </div>
    </motion.div>
  );
}
