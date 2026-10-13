"use client";

import type { TablerIcon } from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  icon: TablerIcon;
  href?: string;
  trend?: string;
  trendUp?: boolean;
  gradient?: string;
  iconBgClassName?: string;
  iconClassName?: string;
  valueClassName?: string;
  "aria-label"?: string;
  /** Stagger delay for grid animation (ms) */
  delay?: number;
}

export function DashboardMetricCard({
  title,
  value,
  icon: Icon,
  href,
  trend,
  trendUp = true,
  gradient = "from-blue-500/10 to-indigo-500/5 dark:from-blue-500/20 dark:to-transparent",
  iconBgClassName = "bg-blue-500/20 dark:bg-blue-500/30",
  iconClassName = "text-blue-500 dark:text-blue-400",
  valueClassName = "",
  "aria-label": ariaLabel,
  delay = 0,
}: DashboardMetricCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold tabular-nums tracking-tight md:text-4xl",
              valueClassName
            )}
          >
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trendUp
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              )}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </span>
          )}
        </div>
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300",
            iconBgClassName
          )}
        >
          <Icon className={cn("size-6", iconClassName)} aria-hidden />
        </div>
      </div>
    </>
  );

  const cardClass = cn(
    "rounded-2xl border p-6 transition-all duration-300",
    "bg-white/40 dark:bg-white/[0.07] backdrop-blur-md",
    "border-white/30 dark:border-white/10",
    "shadow-lg shadow-black/5 dark:shadow-black/20",
    "hover:shadow-xl hover:border-white/40 dark:hover:border-white/20",
    "focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2 dark:focus-within:ring-offset-background",
    `bg-gradient-to-br ${gradient}`
  );

  const Wrapper = href ? Link : "div";
  const wrapperProps = href
    ? { href, "aria-label": ariaLabel ?? `${title}: ${value}` }
    : { role: "article" as const, "aria-label": ariaLabel ?? `${title}: ${value}` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Wrapper className={cn("block h-full", cardClass)} {...wrapperProps}>
        {content}
      </Wrapper>
    </motion.div>
  );
}
