"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MiniListCardProps {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  isLoading?: boolean;
  delay?: number;
}

export function MiniListCard({
  title,
  viewAllHref,
  viewAllLabel = "View All →",
  children,
  emptyMessage = "No items yet",
  emptyIcon,
  isLoading = false,
  delay = 0,
}: MiniListCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-purple-600 hover:text-purple-500 hover:underline dark:text-indigo-400"
          >
            {viewAllLabel}
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              aria-hidden
            />
          ))}
        </div>
      ) : (
        <div className="min-h-[80px]">{children}</div>
      )}
    </motion.div>
  );
}

interface MiniListEmptyProps {
  message: string;
  icon?: ReactNode;
}

export function MiniListEmpty({ message, icon }: MiniListEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      {icon && (
        <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
          {icon}
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
