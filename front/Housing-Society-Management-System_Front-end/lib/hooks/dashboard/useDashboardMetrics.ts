"use client";

import type { DashboardMetrics } from "@/lib/types/dashboard";
import { useMembers } from "@/lib/hooks/entities/useMember";
import { useAppSelector } from "@/lib/store/hooks";
import { useProjects } from "@/lib/hooks/entities/useProject";
import { usePlots } from "@/lib/hooks/entities/usePlot";
import { usePossessions } from "@/lib/hooks/entities/usePossession";
import { useBillDashboardSummary } from "@/lib/hooks/entities/useBillInfo";
import { useDashboardSummary as useInstallmentDashboardSummary } from "@/lib/hooks/entities/useInstallment";
import { useTransfers, useDashboardSummary as useTransferDashboardSummary } from "@/lib/hooks/entities/useTransfer";
import { useFileSummary } from "@/lib/hooks/entities/useFile";
import { useOverdueSummary, useActiveCount } from "@/lib/hooks/entities/useDefaulter";
import { useComplaints } from "@/lib/hooks/entities/useComplaint";
import { useAnnouncements } from "@/lib/hooks/entities/useAnnouncements";
import { useNominees } from "@/lib/hooks/entities/useNominee";
import { useMemo } from "react";

/**
 * Aggregates dashboard metrics from multiple entity APIs.
 * Uses limit: 1 for list endpoints to minimize payload while getting pagination.total.
 */
export function useDashboardMetrics(roleFilter: { canSeeAdmin: boolean }) {
  const membersQuery = useMembers({ page: 1, limit: 1 });
  const reduxMembersTotal = useAppSelector((state) => state.members.total);
  const projectsQuery = useProjects({ page: 1, limit: 1 });
  const plotsQuery = usePlots({ page: 1, limit: 1 });
  const possessionsQuery = usePossessions({ page: 1, limit: 1 });
  const nomineesQuery = useNominees({ page: 1, limit: 1 });
  const complaintsQuery = useComplaints({ page: 1, limit: 1 });
  const billSummary = useBillDashboardSummary();
  const installmentSummary = useInstallmentDashboardSummary();
  const transferSummary = useTransferDashboardSummary();
  const fileSummary = useFileSummary();
  const defaulterOverdue = useOverdueSummary();
  const defaulterActive = useActiveCount();
  const announcementsQuery = useAnnouncements({ page: 1, limit: 1 });
  const transfersQuery = useTransfers({ page: 1, limit: 1 });

  const metrics: DashboardMetrics = useMemo(() => {
    const membersData = membersQuery.data;
    const members =
      membersData?.pagination?.total ??
      reduxMembersTotal ??
      (membersData?.items?.length ? membersData.items.length : 0);
    const projects = projectsQuery.data?.pagination?.total ?? 0;
    const plotsData = plotsQuery.data;
    const plots = plotsData?.pagination?.total ?? 0;
    const plotsAvailable = plotsData?.summary?.available ?? 0;
    const plotsSold = plotsData?.summary?.sold ?? plots - (plotsData?.summary?.available ?? 0);
    const possessions = possessionsQuery.data?.pagination?.total ?? 0;
    const nominees = nomineesQuery.data?.pagination?.total ?? 0;
    const transfers = transfersQuery.data?.pagination?.total ?? 0;
    const installmentsDue = installmentSummary.data?.totalDueToday ?? 0;
    const installmentsOverdue = installmentSummary.data?.totalOverdue ?? 0;
    const defaulters = (defaulterActive.data as { activeDefaulters?: number })?.activeDefaulters ?? 0;
    const billsPending = billSummary.data?.statistics?.totalPending ?? 0;
    const billsOverdue = billSummary.data?.statistics?.totalOverdue ?? 0;
    const complaintsOpen = complaintsQuery.data?.summary?.open ?? complaintsQuery.data?.pagination?.total ?? 0;
    const     announcements = (announcementsQuery.data as { pagination?: { total?: number }; announcements?: unknown[] })?.pagination?.total ??
      (Array.isArray((announcementsQuery.data as { announcements?: unknown[] })?.announcements)
        ? (announcementsQuery.data as { announcements: unknown[] }).announcements.length
        : 0);
    const filesTotal = fileSummary.data?.totalFiles ?? 0;

    return {
      members,
      projects,
      plots,
      plotsAvailable,
      plotsSold,
      possessions,
      nominees,
      transfers,
      installmentsDue,
      installmentsOverdue,
      defaulters,
      billsPending,
      billsOverdue,
      complaintsOpen,
      announcements,
      filesTotal,
    };
  }, [
    membersQuery.data,
    reduxMembersTotal,
    projectsQuery.data,
    plotsQuery.data,
    possessionsQuery.data,
    nomineesQuery.data,
    transfersQuery.data,
    installmentSummary.data,
    billSummary.data,
    defaulterOverdue.data,
    defaulterActive.data,
    complaintsQuery.data,
    announcementsQuery.data,
    fileSummary.data,
  ]);

  const isLoading =
    membersQuery.isLoading ||
    projectsQuery.isLoading ||
    plotsQuery.isLoading ||
    possessionsQuery.isLoading ||
    nomineesQuery.isLoading ||
    billSummary.isLoading ||
    installmentSummary.isLoading ||
    transferSummary.isLoading ||
    fileSummary.isLoading ||
    defaulterOverdue.isLoading ||
    defaulterActive.isLoading ||
    complaintsQuery.isLoading ||
    transfersQuery.isLoading;

  const isError =
    membersQuery.isError ||
    projectsQuery.isError ||
    plotsQuery.isError ||
    possessionsQuery.isError ||
    nomineesQuery.isError ||
    billSummary.isError ||
    installmentSummary.isError ||
    complaintsQuery.isError;

  return {
    metrics,
    isLoading,
    isError,
    refetch: () => {
      membersQuery.refetch();
      projectsQuery.refetch();
      plotsQuery.refetch();
      possessionsQuery.refetch();
      nomineesQuery.refetch();
      billSummary.refetch();
      installmentSummary.refetch();
      transferSummary.refetch();
      fileSummary.refetch();
      defaulterOverdue.refetch();
      defaulterActive.refetch();
      complaintsQuery.refetch();
    },
    raw: {
      billSummary: billSummary.data,
      installmentSummary: installmentSummary.data,
      transferSummary: transferSummary.data,
      fileSummary: fileSummary.data,
      defaulterOverdue: defaulterOverdue.data,
      defaulterActive: defaulterActive.data,
      plotsSummary: plotsQuery.data?.summary,
    },
  };
}
