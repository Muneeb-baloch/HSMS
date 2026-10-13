"use client";

import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconBuildingSkyscraper,
  IconFileText,
  IconKey,
  IconMapPin,
  IconReceipt,
  IconSpeakerphone,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import { useDashboardMetrics } from "@/lib/hooks/dashboard/useDashboardMetrics";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { hasPermission, UserRole } from "@/lib/constants/roles";

interface DashboardMetricsRowProps {
  userRole: UserRole;
}

export function DashboardMetricsRow({ userRole }: DashboardMetricsRowProps) {
  const { metrics, isLoading, isError } = useDashboardMetrics({ canSeeAdmin: hasPermission(userRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]) });

  const canSeeMember = hasPermission(userRole, [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canSeeAdmin = hasPermission(userRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
        role="region"
        aria-label="Dashboard metrics loading"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl bg-white/20 dark:bg-white/10 border border-white/10 dark:border-white/5"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive" role="alert">
        Failed to load dashboard metrics. Please refresh the page.
      </div>
    );
  }

  const iconStyles = [
    { iconBgClassName: "bg-blue-500/20", iconClassName: "text-blue-500 dark:text-blue-400" },
    { iconBgClassName: "bg-emerald-500/20", iconClassName: "text-emerald-500 dark:text-emerald-400" },
    { iconBgClassName: "bg-violet-500/20", iconClassName: "text-violet-500 dark:text-violet-400" },
    { iconBgClassName: "bg-amber-500/20", iconClassName: "text-amber-500 dark:text-amber-400" },
    { iconBgClassName: "bg-rose-500/20", iconClassName: "text-rose-500 dark:text-rose-400" },
    { iconBgClassName: "bg-cyan-500/20", iconClassName: "text-cyan-500 dark:text-cyan-400" },
    { iconBgClassName: "bg-indigo-500/20", iconClassName: "text-indigo-500 dark:text-indigo-400" },
    { iconBgClassName: "bg-orange-500/20", iconClassName: "text-orange-500 dark:text-orange-400" },
  ];
  const cards = [
    canSeeMember && { title: "Members", value: metrics.members, icon: IconUsers, href: "/members", ...iconStyles[0] },
    canSeeAdmin && { title: "Projects", value: metrics.projects, icon: IconBuildingSkyscraper, href: "/projects", ...iconStyles[1] },
    canSeeMember && { title: "Plots", value: metrics.plots, icon: IconMapPin, href: "/plots", ...iconStyles[2] },
    canSeeMember && { title: "Available", value: metrics.plotsAvailable, icon: IconMapPin, ...iconStyles[3] },
    canSeeMember && { title: "Sold", value: metrics.plotsSold, icon: IconMapPin, ...iconStyles[4] },
    canSeeAdmin && { title: "Possessions", value: metrics.possessions, icon: IconKey, href: "/possessions", ...iconStyles[5] },
    canSeeAdmin && { title: "Nominees", value: metrics.nominees, icon: IconUserCircle, href: "/nominees", ...iconStyles[6] },
    canSeeAdmin && { title: "Transfers", value: metrics.transfers, icon: IconArrowsExchange, href: "/transfers", ...iconStyles[7] },
    canSeeAdmin && { title: "Installments Due", value: metrics.installmentsDue, icon: IconReceipt, href: "/installments", ...iconStyles[0] },
    canSeeAdmin && { title: "Defaulters", value: metrics.defaulters, icon: IconAlertTriangle, href: "/defaulter", gradient: "from-rose-500/10 to-transparent", ...iconStyles[4] },
    canSeeAdmin && { title: "Bills Pending", value: metrics.billsPending, icon: IconReceipt, href: "/billinfo", ...iconStyles[1] },
    canSeeAdmin && { title: "Bills Overdue", value: metrics.billsOverdue, icon: IconReceipt, gradient: "from-amber-500/10 to-transparent", ...iconStyles[3] },
    canSeeAdmin && { title: "Complaints Open", value: metrics.complaintsOpen, icon: IconAlertTriangle, href: "/complaints", ...iconStyles[2] },
    canSeeAdmin && { title: "Announcements", value: metrics.announcements, icon: IconSpeakerphone, href: "/announcements", ...iconStyles[6] },
    canSeeAdmin && { title: "Files", value: metrics.filesTotal, icon: IconFileText, href: "/file", ...iconStyles[7] },
  ].filter(Boolean) as Array<{ title: string; value: number; icon: typeof IconUsers; href?: string; gradient?: string; iconBgClassName?: string; iconClassName?: string }>;

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
      role="region"
      aria-label="Dashboard overview metrics"
    >
      {cards.map((card, idx) => (
        <DashboardMetricCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          href={card.href}
          gradient={card.gradient}
          iconBgClassName={card.iconBgClassName}
          iconClassName={card.iconClassName}
          delay={idx * 40}
        />
      ))}
    </div>
  );
}
