"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  IconAlertTriangle,
  IconBuildingSkyscraper,
  IconMapPin,
  IconSpeakerphone,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { useAuthStatus } from "@/lib/hooks/useAuth";
import { UserRole } from "@/lib/constants/roles";
import { hasPermission } from "@/lib/constants/roles";
import { useDashboardMetrics } from "@/lib/hooks/dashboard/useDashboardMetrics";
import { useProjects } from "@/lib/hooks/entities/useProject";
import { KpiCard } from "./KpiCard";
import { ProgressCard } from "./ProgressCard";
import { DashboardHeader } from "./DashboardHeader";
import { PaymentTrendChart } from "./PaymentTrendChart";
import { PlotSalesChart } from "./PlotSalesChart";
import { MemberOverviewCard } from "./MemberOverviewCard";
import { DefaultersPreview } from "./DefaultersPreview";
import { ComplaintsSnapshot } from "./ComplaintsSnapshot";
import { FinancialQuickView } from "./FinancialQuickView";
import { RecentActivityFeed } from "./RecentActivityFeed";
import { ProjectStatus, ProjectType } from "@/lib/types/project";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashboardGrid() {
  const { user } = useAuthStatus();
  const userRole = (user?.role as UserRole) ?? UserRole.GUEST;
  const canSeeAdmin = hasPermission(userRole, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ]);
  const canSeeModerator = hasPermission(userRole, [
    UserRole.MODERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ]);

  const { metrics, isLoading, isError } = useDashboardMetrics({
    canSeeAdmin: true,
  });

  const projectsQuery = useProjects({
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const projects = projectsQuery.data?.items ?? [];

  const residentialCount =
    projects.filter((p) => p.projType === ProjectType.RESIDENTIAL).length || 0;
  const commercialCount =
    projects.filter((p) => p.projType === ProjectType.COMMERCIAL).length || 0;
  const upcomingCount =
    projects.filter((p) => p.projStatus === ProjectStatus.PLANNING).length ||
    metrics.plotsAvailable;

  const totalProjects = metrics.projects;
  const activeCount =
    projects.filter(
      (p) =>
        p.projStatus === ProjectStatus.UNDER_DEVELOPMENT ||
        p.projStatus === ProjectStatus.ON_HOLD
    ).length || 0;
  const completedCount =
    projects.filter((p) => p.projStatus === ProjectStatus.COMPLETED).length ||
    metrics.possessions;
  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((acc, p) => acc + (p.progressPercentage ?? 0), 0) /
            projects.length
        )
      : metrics.plots > 0
        ? Math.round((metrics.plotsSold / metrics.plots) * 100)
        : 0;

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        role="alert"
      >
        Failed to load dashboard metrics. Please refresh the page.
      </motion.div>
    );
  }

  const residentialPercent =
    totalProjects > 0
      ? Math.round((residentialCount / totalProjects) * 100)
      : residentialCount > 0 ? 100 : 0;
  const commercialPercent =
    totalProjects > 0
      ? Math.round((commercialCount / totalProjects) * 100)
      : commercialCount > 0 ? 100 : 0;
  const upcomingPercent =
    totalProjects > 0
      ? Math.round((Math.min(upcomingCount, totalProjects) / totalProjects) * 100)
      : upcomingCount > 0 ? 50 : 0;

  return (
    <div className="space-y-6">
      <DashboardHeader />

      {/* KPI Cards Row */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        role="region"
        aria-label="Key metrics"
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
              aria-hidden
            />
          ))
        ) : (
          <>
            <KpiCard
              title="Members"
              value={metrics.members}
              icon={IconUsers}
              href="/members"
              iconBgClassName="bg-purple-100"
              iconClassName="text-purple-600"
              delay={0}
            />
            <KpiCard
              title="Total Projects"
              value={totalProjects}
              icon={IconBuildingSkyscraper}
              href={canSeeModerator ? "/projects" : undefined}
              iconBgClassName="bg-teal-100"
              iconClassName="text-teal-600"
              delay={50}
            />
            <KpiCard
              title="Active"
              value={activeCount}
              icon={IconTrendingUp}
              iconBgClassName="bg-amber-100"
              iconClassName="text-amber-600"
              delay={100}
            />
            <KpiCard
              title="Completed"
              value={completedCount}
              icon={IconMapPin}
              iconBgClassName="bg-teal-100"
              iconClassName="text-teal-600"
              delay={150}
            />
            <KpiCard
              title="Avg. Progress"
              value={`${avgProgress}%`}
              icon={IconTrendingUp}
              iconBgClassName="bg-indigo-100"
              iconClassName="text-indigo-600"
              delay={200}
            />
          </>
        )}
      </section>

      {/* Charts Section — Double-line + Gradient Area */}
      {canSeeAdmin && (
        <section
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          role="region"
          aria-label="Analytics charts"
        >
          <PaymentTrendChart />
          <PlotSalesChart />
        </section>
      )}

      {/* Regional / Block Breakdown */}
      {canSeeAdmin && (
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          role="region"
          aria-label="Project breakdown"
        >
          <ProgressCard
            title="Residential Projects"
            subtext="Housing projects"
            value={residentialCount}
            max={totalProjects > 0 ? totalProjects : undefined}
            progressPercent={residentialPercent}
            barColor="green"
            icon={IconBuildingSkyscraper}
            delay={0}
          />
          <ProgressCard
            title="Commercial Projects"
            subtext="Commercial plots"
            value={commercialCount}
            max={totalProjects > 0 ? totalProjects : undefined}
            progressPercent={commercialPercent}
            barColor="purple"
            icon={IconBuildingSkyscraper}
            delay={50}
          />
          <ProgressCard
            title="Upcoming Blocks"
            subtext="Available plots"
            value={metrics.plotsAvailable}
            max={metrics.plots > 0 ? metrics.plots : undefined}
            progressPercent={
              metrics.plots > 0
                ? Math.round((metrics.plotsAvailable / metrics.plots) * 100)
                : 0
            }
            barColor="red"
            icon={IconMapPin}
            delay={100}
          />
        </section>
      )}

      {/* Manage Section */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        role="region"
        aria-label="Manage modules"
      >
        {/* Projects Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Projects</h3>
            {canSeeModerator && (
              <Link
                href="/projects"
                className="text-sm font-medium text-purple-600 hover:text-purple-500 hover:underline"
              >
                Manage →
              </Link>
            )}
          </div>
          <p className="text-3xl font-bold tabular-nums text-gray-900">
            {totalProjects}
          </p>
          <p className="mt-0.5 text-sm text-gray-600">Managed projects</p>
          {canSeeModerator && (
            <motion.a
              href="/projects/create"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white",
                "transition-colors hover:bg-purple-500"
              )}
            >
              + Add Project
            </motion.a>
          )}
        </motion.div>

        {/* Onboarding / Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Overview</h3>
            <Link
              href="/members"
              className="text-sm font-medium text-purple-600 hover:text-purple-500 hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat
              icon={<IconUsers className="size-5 text-purple-600" />}
              value={metrics.members}
              label="Members"
              href="/members"
            />
            <MiniStat
              icon={<IconBuildingSkyscraper className="size-5 text-blue-600" />}
              value={metrics.projects}
              label="Projects"
              href={canSeeModerator ? "/projects" : undefined}
            />
            <MiniStat
              icon={<IconMapPin className="size-5 text-teal-600" />}
              value={metrics.plots}
              label="Plots"
              href="/plots"
            />
            {canSeeAdmin ? (
              <MiniStat
                icon={
                  <IconAlertTriangle className="size-5 text-amber-600" />
                }
                value={metrics.defaulters}
                label="Defaulters"
                href="/defaulter"
              />
            ) : (
              <MiniStat
                icon={<IconMapPin className="size-5 text-emerald-600" />}
                value={metrics.plotsAvailable}
                label="Available"
                href="/plots"
              />
            )}
          </div>
        </motion.div>
      </section>

      {/* Preview Cards: Members, Defaulters, Complaints, Financial */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="region"
        aria-label="Module previews"
      >
        <MemberOverviewCard />
        {canSeeAdmin && (
          <>
            <DefaultersPreview />
            <ComplaintsSnapshot />
            <FinancialQuickView />
          </>
        )}
      </section>

      {/* Recent Activity Feed — Combined projects, members, complaints */}
      <RecentActivityFeed />
    </div>
  );
}

function MiniStat({
  icon,
  value,
  label,
  href,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums text-gray-900">{value}</p>
        <p className="text-xs text-gray-600">{label}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-50"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-2 rounded-lg p-2">{content}</div>;
}
