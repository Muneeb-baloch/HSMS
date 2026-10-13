"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { IconChartBar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  isEmpty?: boolean;
  isLoading?: boolean;
}

export function ChartCard({
  title,
  description,
  children,
  className,
  delay = 0,
  isEmpty = false,
  isLoading = false,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm backdrop-blur-sm",
        "transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-[320px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="size-10 animate-spin rounded-full border-2 border-gray-200 border-t-purple-500"
              aria-hidden
            />
            <p className="text-sm text-gray-500">Loading chart...</p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-900/30">
          <IconChartBar className="size-12 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No data yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Data will appear here as records are added
          </p>
        </div>
      ) : (
        <div className="h-[320px] w-full min-w-0">{children}</div>
      )}
    </motion.div>
  );
}
