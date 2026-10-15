"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { SendNoticeDialog } from "@/components/defaulter/SendNoticeDialog";
import { defaulterColumns } from "@/lib/constants/defaulterColumns.constants";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useDefaulters,
  useDefaulterStatistics,
  useSendNotice,
} from "@/lib/hooks/entities/useDefaulter";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetFilters, setFilters } from "@/lib/store/slices/defaulterSlice";
import { AlertCircle, Download, DollarSign, Mail, RefreshCw, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DefaulterRow } from "@/lib/types/defaulter";
import { formatCurrency } from "@/lib/utils/format";

function getMemberName(row: DefaulterRow | null): string {
  return row?.member?.memName || row?.member?.fullName || "—";
}

export function DefaulterList() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const filters = useAppSelector((state) => state.defaulters?.filters || {});
  const [searchValue, setSearchValue] = useState("");

  const [sendNoticeDialog, setSendNoticeDialog] = useState<{
    open: boolean;
    row: DefaulterRow | null;
  }>({ open: false, row: null });

  const { data, isLoading } = useDefaulters(filters);
  const { data: statistics } = useDefaulterStatistics();
  const sendNoticeMutation = useSendNotice();

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleView = (fileId: string) => router.push(`/defaulter/view/${fileId}`);

  const handleSendNoticeClick = (row: DefaulterRow) => {
    if (canUpdate) setSendNoticeDialog({ open: true, row });
  };
  const handleSendNoticeSubmit = async (data: {
    noticeType: "WARNING" | "FINAL" | "LEGAL";
    noticeContent: string;
    sendMethod: "EMAIL" | "SMS" | "LETTER" | "ALL";
  }) => {
    if (!sendNoticeDialog.row) return;
    await sendNoticeMutation.mutateAsync({
      fileId: sendNoticeDialog.row.fileId,
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

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setSearchValue("");
  };

  const handleExportReport = () => {
    const csvData = [
      [
        "Member",
        "Plot",
        "File",
        "Installments Overdue",
        "Bills Overdue",
        "Total Overdue",
        "Status",
        "Days Overdue",
        "Notices Sent",
      ],
      ...(data?.items || []).map((item) => [
        getMemberName(item),
        item.plot?.plotNo || "—",
        item.file?.fileRegNo || "—",
        item.installmentsOverdue,
        item.billsOverdue,
        item.totalOverdue,
        item.actualStatus,
        item.daysOverdue,
        item.noticeSentCount,
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
          { label: "Warning", value: "Warning" },
          { label: "Suspended", value: "Suspended" },
          { label: "Legal Action", value: "Legal Action" },
        ],
        onChange: handleStatusFilter,
      },
      {
        id: "sortBy",
        label: "Sort By",
        type: "select" as const,
        options: [
          { label: "Days Overdue", value: "daysOverdue" },
          { label: "Total Overdue", value: "totalOverdue" },
          { label: "Installments Overdue", value: "installmentsOverdue" },
          { label: "Bills Overdue", value: "billsOverdue" },
        ],
        onChange: (value: string) => dispatch(setFilters({ sortBy: value as any, page: 1 })),
      },
      {
        id: "sortOrder",
        label: "Order",
        type: "select" as const,
        options: [
          { label: "Ascending", value: "asc" },
          { label: "Descending", value: "desc" },
        ],
        onChange: (value: "asc" | "desc") => dispatch(setFilters({ sortOrder: value, page: 1 })),
      },
    ],
    enableActions: true,
    actions: {
      customActions: [
        {
          label: "View",
          icon: <span>👁️</span>,
          onClick: (row: DefaulterRow) => handleView(row.fileId),
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
          onPageSizeChange: (size: number) => dispatch(setFilters({ limit: size, page: 1 })),
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
          Files with installments or bills overdue past the society&apos;s threshold — computed live from the ledger, not a manually-maintained list.
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
            title="Installments Overdue"
            value={formatCurrency(statistics.totalInstallmentsOverdue ?? 0)}
            icon={AlertCircle}
            iconBgClassName="bg-yellow-100"
            iconClassName="text-yellow-600"
            valueClassName="text-yellow-600"
          />
          <SummaryCard
            title="Bills Overdue"
            value={formatCurrency(statistics.totalBillsOverdue ?? 0)}
            icon={AlertCircle}
            iconBgClassName="bg-orange-100"
            iconClassName="text-orange-600"
            valueClassName="text-orange-600"
          />
          <SummaryCard
            title="Total Overdue"
            value={formatCurrency(statistics.totalOverdueAmount ?? 0)}
            icon={DollarSign}
            iconBgClassName="bg-red-100"
            iconClassName="text-red-600"
            valueClassName="text-red-600"
          />
        </div>
      )}

      <ActionBar
        left={
          Object.keys(filters).length > 4 && (
            <Button variant="glass" size="sm" onClick={handleResetFilters}>
              <RefreshCw className="size-4" />
              Reset Filters
            </Button>
          )
        }
        right={
          <Button variant="glass" size="sm" onClick={handleExportReport}>
            <Download className="size-4" />
            Export
          </Button>
        }
      />

      <Card>
        <CardHeader icon={UserX}>
          <CardTitle>Defaulter List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.items || []}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      <SendNoticeDialog
        open={sendNoticeDialog.open}
        onOpenChange={(open) =>
          setSendNoticeDialog((p) => ({ ...p, open, row: open ? p.row : null }))
        }
        defaulterName={sendNoticeDialog.row ? getMemberName(sendNoticeDialog.row) : undefined}
        onSubmit={handleSendNoticeSubmit}
      />
    </div>
  );
}
