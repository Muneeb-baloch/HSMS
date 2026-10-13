"use client";

import { motion } from "framer-motion";
import { IconUser, IconUsers } from "@tabler/icons-react";
import { useMembers } from "@/lib/hooks/entities/useMember";
import { useAppSelector } from "@/lib/store/hooks";
import { MiniListCard, MiniListEmpty } from "./MiniListCard";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function MemberOverviewCard() {
  const membersQuery = useMembers({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const reduxTotal = useAppSelector((state) => state.members.total);

  const members = membersQuery.data?.items ?? [];
  const total =
    membersQuery.data?.pagination?.total ??
    reduxTotal ??
    (members.length > 0 ? members.length : 0);
  const isLoading = membersQuery.isLoading;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const newThisMonth = members.filter((m) => {
    const d = m.createdAt ? new Date(m.createdAt as string) : null;
    return d && d >= thisMonth;
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Members
        </h3>
        <Link
          href="/members"
          className="text-xs font-medium text-purple-600 hover:underline dark:text-indigo-400"
        >
          View All →
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
          <IconUsers className="size-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
            {total}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {newThisMonth > 0 ? `+${newThisMonth} this month` : "Total members"}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 dark:border-gray-700/50">
        <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          Recent Members
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : members.length === 0 ? (
          <MiniListEmpty
            message="No recent members yet"
            icon={<IconUser className="size-5" />}
          />
        ) : (
          <ul className="space-y-1.5">
            {members.slice(0, 5).map((m) => (
              <li key={m._id}>
                <Link
                  href={`/members/view/${m._id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                    {m.memName?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {m.memName ?? "Unknown"}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {m.createdAt
                        ? formatDistanceToNow(new Date(m.createdAt as string), {
                            addSuffix: true,
                          })
                        : ""}
                    </p>
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
