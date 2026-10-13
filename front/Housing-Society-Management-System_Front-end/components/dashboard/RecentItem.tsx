"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RecentItemProps {
  name: string;
  type?: string;
  progress?: number;
  status: "active" | "completed" | "pending";
  href?: string;
  icon?: React.ReactNode;
}

const STATUS_STYLES = {
  active: "bg-amber-100 text-amber-700",
  completed: "bg-teal-100 text-teal-700",
  pending: "bg-gray-100 text-gray-600",
};

export function RecentItem({
  name,
  type,
  progress = 0,
  status,
  href,
  icon,
}: RecentItemProps) {
  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Wrapper
        className={cn(
          "flex items-center justify-between gap-4 rounded-lg px-3 py-2.5",
          "transition-colors hover:bg-gray-50",
          href && "cursor-pointer"
        )}
        {...wrapperProps}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {icon ? (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              {icon}
            </div>
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{name}</p>
            {type && (
              <p className="truncate text-xs text-gray-500">{type}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden sm:block">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gray-400"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{progress}%</p>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              STATUS_STYLES[status]
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </Wrapper>
    </motion.div>
  );
}
