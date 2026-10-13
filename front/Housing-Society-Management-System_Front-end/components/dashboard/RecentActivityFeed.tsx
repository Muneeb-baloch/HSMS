"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  IconBuildingSkyscraper,
  IconUser,
  IconAlertTriangle,
  IconArrowsExchange,
} from "@tabler/icons-react";
import { useProjects } from "@/lib/hooks/entities/useProject";
import { useMembers } from "@/lib/hooks/entities/useMember";
import { useComplaints } from "@/lib/hooks/entities/useComplaint";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type ActivityItem =
  | { type: "project"; id: string; title: string; date: string; href: string }
  | { type: "member"; id: string; title: string; date: string; href: string }
  | { type: "complaint"; id: string; title: string; date: string; href: string };

export function RecentActivityFeed() {
  const projectsQuery = useProjects({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const membersQuery = useMembers({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const complaintsQuery = useComplaints({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const projects = projectsQuery.data?.items ?? [];
  const members = membersQuery.data?.items ?? [];
  const complaints = complaintsQuery.data?.items ?? [];

  const activities = useMemo((): ActivityItem[] => {
    const items: ActivityItem[] = [];

    projects.forEach((p) => {
      items.push({
        type: "project",
        id: p._id,
        title: p.projName ?? "Project",
        date: (p.createdAt as string) ?? "",
        href: `/projects/${p._id}`,
      });
    });
    members.forEach((m) => {
      items.push({
        type: "member",
        id: m._id,
        title: m.memName ?? "Member",
        date: (m.createdAt as string) ?? "",
        href: `/members/view/${m._id}`,
      });
    });
    (complaints as Array<{ _id: string; compTitle?: string; createdAt?: string }>).forEach((c) => {
      items.push({
        type: "complaint",
        id: c._id,
        title: c.compTitle ?? "Complaint",
        date: c.createdAt ?? "",
        href: `/complaints/view/${c._id}`,
      });
    });

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [projects, members, complaints]);

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "project":
        return <IconBuildingSkyscraper className="size-4 text-teal-600" />;
      case "member":
        return <IconUser className="size-4 text-purple-600" />;
      case "complaint":
        return <IconAlertTriangle className="size-4 text-amber-600" />;
    }
  };

  const getLabel = (type: ActivityItem["type"]) => {
    switch (type) {
      case "project":
        return "Project";
      case "member":
        return "Member";
      case "complaint":
        return "Complaint";
    }
  };

  const isLoading =
    projectsQuery.isLoading || membersQuery.isLoading || complaintsQuery.isLoading;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35 }}
      className="rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700/50">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <Link
          href="/members"
          className="text-xs font-medium text-purple-600 hover:underline dark:text-indigo-400"
        >
          View All →
        </Link>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse px-4"
              aria-hidden
            />
          ))
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <IconBuildingSkyscraper className="size-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No recent activity yet
            </p>
          </div>
        ) : (
          activities.map((a) => (
            <Link
              key={`${a.type}-${a.id}`}
              href={a.href}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                {getIcon(a.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {a.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getLabel(a.type)} · {a.date ? formatDistanceToNow(new Date(a.date), { addSuffix: true }) : ""}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </motion.section>
  );
}
