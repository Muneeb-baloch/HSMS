"use client";

import { motion } from "framer-motion";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useComplaints } from "@/lib/hooks/entities/useComplaint";
import { MiniListEmpty } from "./MiniListCard";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function ComplaintsSnapshot() {
  const complaintsQuery = useComplaints({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const items = complaintsQuery.data?.items ?? [];
  const summary = complaintsQuery.data?.summary as
    | { open?: number; in_progress?: number; urgent?: number }
    | undefined;
  const openCount = summary?.open ?? complaintsQuery.data?.pagination?.total ?? 0;
  const urgentCount = summary?.urgent ?? 0;
  const isLoading = complaintsQuery.isLoading;

  const getStatus = (c: (typeof items)[0]) => {
    const s = c.status ?? (c.statusId as { statusName?: string })?.statusName;
    return typeof s === "string" ? s : "Open";
  };

  const getPriority = (c: (typeof items)[0]) =>
    (c as { compPriority?: string }).compPriority ?? "medium";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Complaints
        </h3>
        <Link
          href="/complaints"
          className="text-xs font-medium text-purple-600 hover:underline dark:text-indigo-400"
        >
          View All Complaints →
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
          <IconAlertTriangle className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
            {openCount} open
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {urgentCount > 0 ? `${urgentCount} urgent` : "All caught up"}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          Recent
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
        ) : items.length === 0 ? (
          <MiniListEmpty
            message="No recent complaints"
            icon={<IconAlertTriangle className="size-5" />}
          />
        ) : (
          <ul className="space-y-1.5">
            {items.slice(0, 3).map((c) => (
              <li key={c._id}>
                <Link
                  href={`/complaints/view/${c._id}`}
                  className="block rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {c.compTitle ?? "Complaint"}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className={`
                        rounded px-1.5 py-0.5 text-[10px] font-medium
                        ${getPriority(c) === "emergency" || getPriority(c) === "high"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}
                      `}
                    >
                      {getStatus(c)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {c.createdAt
                        ? formatDistanceToNow(new Date(c.createdAt as string), {
                            addSuffix: true,
                          })
                        : ""}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
