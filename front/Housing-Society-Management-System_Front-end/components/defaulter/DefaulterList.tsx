"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { DeleteDefaulterDialog } from "@/components/defaulter/DeleteDefaulterDialog";
import { ResolveDefaulterDialog } from "@/components/defaulter/ResolveDefaulterDialog";
import { SendNoticeDialog } from "@/components/defaulter/SendNoticeDialog";
import { defaulterColumns } from "@/lib/constants/defaulterColumns.constants";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useDefaulters,
  useDefaulterStatistics,
  useDeleteDefaulter,
  useSendNotice,
  useResolveDefaulter,
} from "@/lib/hooks/entities/useDefaulter";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetFilters, setFilters } from "@/lib/store/slices/defaulterSlice";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  DollarSign,
  Mail,
  Plus,
  RefreshCw,
  Trash2,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Defaulter } from "@/lib/types/defaulter";
import { formatCurrency } from "@/lib/utils/format";

function getMemberName(memId: Defaulter["memId"]): string {
  if (!memId || typeof memId === "string") return "—";
  return (memId as { memName?: string; fullName?: string }).memName ||
    (memId as { fullName?: string }).fullName || "—";
}

export function DefaulterList() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const filters = useAppSelector((state) => state.defaulters?.filters || {});
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    row: Defaulter | null;
  }>({ open: false, row: null });
  const [sendNoticeDialog, setSendNoticeDialog] = useState<{
    open: boolean;
    row: Defaulter | null;
  }>({ open: false, row: null });
  const [resolveDialog, setResolveDialog] = useState<{
    open: boolean;
    row: Defaulter | null;
  }>({ open: false, row: null });

  const { data, isLoading } = useDefaulters(filters);
  const { data: statistics } = useDefaulterStatistics();
  const deleteMutation = useDeleteDefaulter();
  const sendNoticeMutation = useSendNotice();
  const resolveMutation = useResolveDefaulter();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleCreate = () => router.push("/defaulter/create");
  const handleEdit = (id: string) => router.push(`/defaulter/edit/${id}`);
  const handleView = (id: string) => router.push(`/defaulter/view/${id}`);

  const handleDeleteClick = (row: Defaulter) => {
    if (canDelete) setDeleteDialog({ open: true, row });
  };
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.row) return;
    await deleteMutation.mutateAsync(deleteDialog.row._id);
  };

  const handleSendNoticeClick = (row: Defaulter) => {
    if (row.status !== "Resolved" && canUpdate)
      setSendNoticeDialog({ open: true, row });
  };
  const handleSendNoticeSubmit = async (data: {
    noticeType: "WARNING" | "FINAL" | "LEGAL";
    noticeContent: string;
    sendMethod: "EMAIL" | "SMS" | "LETTER" | "ALL";
  }) => {
    if (!sendNoticeDialog.row) return;
    await sendNoticeMutation.mutateAsync({
      id: sendNoticeDialog.row._id,
      data,
    });
  };

  const handleResolveClick = (row: Defaulter) => {
    if (row.status !== "Resolved" && canUpdate)
      setResolveDialog({ open: true, row });
  };
  const handleResolveSubmit = async (data: {
    paymentAmount: number;
    paymentDate: string | Date;
    paymentMethod: string;
    remarks?: string;
  }) => {
    if (!resolveDialog.row) return;
    await resolveMutation.mutateAsync({
      id: resolveDialog.row._id,
      data,
    });
  };

  const handleSearch = (search: string) => {
    setSearchValue(search);
    dispatch(setFilters({ search, page: 1 }));
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    if (status === "all") {
      dispatch(setFilters({ status: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ status: status as any, page: 1 }));
    }
  };

  const handleMemberFilter = (memId: string) => {
    if (memId === "all") {
      dispatch(setFilters({ memId: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ memId, page: 1 }));
    }
  };

  const handlePlotFilter = (plotId: string) => {
    if (plotId === "all") {
      dispatch(setFilters({ plotId: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ plotId, page: 1 }));
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setSearchValue("");
    setSelectedIds([]);
  };

  const handleSelectionChange = (ids: string[]) => setSelectedIds(ids);

  const handleExportReport = () => {
    const csvData = [
      [
        "Member",
        "Plot",
        "Amount",
        "Status",
        "Overdue Days",
        "Notice Sent",
        "Created",
      ],
      ...(data?.items || []).map((item) => [
        typeof item.memId === "object"
          ? item.memId?.memName || item.memId?.fullName || "—"
          : "—",
        typeof item.plotId === "object" ? item.plotId?.plotNo : "—",
        item.totalOverdueAmount,
        item.status,
        item.daysOverdue,
        item.noticeSentCount,
        new Date(item.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `defaulters-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tableConfig = {
    columns: defaulterColumns,
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All", value: "all" },
          { label: "Active", value: "Warning" },
          { label: "Suspended", value: "Suspended" },
          { label: "Legal Action", value: "Legal Action" },
          { label: "Resolved", value: "Resolved" },
        ],
        onChange: handleStatusFilter,
      },
      {
        id: "sortBy",
        label: "Sort By",
        type: "select" as const,
        options: [
          { label: "Overdue Days", value: "daysOverdue" },
          { label: "Amount", value: "totalOverdueAmount" },
          { label: "Created", value: "createdAt" },
          { label: "Notice Count", value: "noticeSentCount" },
        ],
        onChange: (value: string) =>
          dispatch(setFilters({ sortBy: value, page: 1 })),
      },
      {
        id: "sortOrder",
        label: "Order",
        type: "select" as const,
        options: [
          { label: "Ascending", value: "asc" },
          { label: "Descending", value: "desc" },
        ],
        onChange: (value: "asc" | "desc") =>
          dispatch(setFilters({ sortOrder: value, page: 1 })),
      },
    ],
    enableActions: true,
    enableSelection: true,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: undefined,
      customActions: [
        {
          label: "View",
          icon: <span>👁️</span>,
          onClick: (row: Defaulter) => handleView(row._id),
          variant: "outline" as const,
        },
        ...(canUpdate
          ? [
              {
                label: "Send Notice",
                icon: <Mail className="h-4 w-4" />,
                onClick: handleSendNoticeClick,
                variant: "outline" as const,
              },
              {
                label: "Resolve",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: handleResolveClick,
                variant: "outline" as const,
              },
            ]
          : []),
        ...(canDelete
          ? [
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: handleDeleteClick,
                variant: "outline" as const,
              },
            ]
          : []),
      ],
    },
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: handlePageChange,
          pageSize: data.pagination.limit,
          onPageSizeChange: (size: number) =>
            dispatch(setFilters({ limit: size, page: 1 })),
          totalItems: data.pagination.total,
        }
      : undefined,
    responsive: { showMobileView: true, stickyHeader: true },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Defaulters</h1>
        <p className="text-muted-foreground">
          Manage overdue payments and defaulters
        </p>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Defaulters"
            value={statistics.totalDefaulters ?? 0}
            icon={UserX}
            iconBgClassName="bg-blue-100"
            iconClassName="text-blue-600"
          />
          <SummaryCard
            title="Active Defaulters"
            value={statistics.activeDefaulters ?? 0}
            icon={AlertCircle}
            iconBgClassName="bg-yellow-100"
            iconClassName="text-yellow-600"
            valueClassName="text-yellow-600"
          />
          <SummaryCard
            title="Total Overdue Amount"
            value={formatCurrency(statistics.totalOverdueAmount ?? 0)}
            icon={DollarSign}
            iconBgClassName="bg-red-100"
            iconClassName="text-red-600"
            valueClassName="text-red-600"
          />
          <SummaryCard
            title="Resolved"
            value={statistics.byStatus?.Resolved ?? 0}
            icon={CheckCircle2}
            iconBgClassName="bg-green-100"
            iconClassName="text-green-600"
            valueClassName="text-green-600"
          />
        </div>
      )}

      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 4 && (
              <Button variant="glass" size="sm" onClick={handleResetFilters}>
                <RefreshCw className="size-4" />
                Reset Filters
              </Button>
            )}
            {selectedIds.length > 0 && (
              <span className="text-xs text-muted-foreground self-center">
                {selectedIds.length} selected
              </span>
            )}
            <Button variant="glass" size="sm" onClick={handleExportReport}>
              <Download className="size-4" />
              Export
            </Button>
          </>
        }
        right={
          canCreate && (
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus className="size-4" />
              Add Defaulter
            </Button>
          )
        }
      />

      <Card>
        <CardHeader icon={UserX}>
          <CardTitle>Defaulter Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.items || []}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onSelectionChange={handleSelectionChange}
          />
        </CardContent>
      </Card>

      <DeleteDefaulterDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((p) => ({ ...p, open, row: open ? p.row : null }))
        }
        defaulterName={deleteDialog.row ? getMemberName(deleteDialog.row.memId) : undefined}
        onConfirm={handleDeleteConfirm}
      />
      <SendNoticeDialog
        open={sendNoticeDialog.open}
        onOpenChange={(open) =>
          setSendNoticeDialog((p) => ({
            ...p,
            open,
            row: open ? p.row : null,
          }))
        }
        defaulterName={
          sendNoticeDialog.row
            ? getMemberName(sendNoticeDialog.row.memId)
            : undefined
        }
        onSubmit={handleSendNoticeSubmit}
      />
      <ResolveDefaulterDialog
        open={resolveDialog.open}
        onOpenChange={(open) =>
          setResolveDialog((p) => ({
            ...p,
            open,
            row: open ? p.row : null,
          }))
        }
        defaulterName={
          resolveDialog.row
            ? getMemberName(resolveDialog.row.memId)
            : undefined
        }
        overdueAmount={resolveDialog.row?.totalOverdueAmount}
        onSubmit={handleResolveSubmit}
      />
    </div>
  );
}
