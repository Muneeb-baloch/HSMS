"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { complaintColumns } from "@/lib/constants/complaintColumns.constants";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useComplaints,
  useDeleteComplaint,
} from "@/lib/hooks/entities/useComplaint";
import { Complaint } from "@/lib/types/complaint";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetFilters, setFilters } from "@/lib/store/slices/complaintSlice";
import { SummaryCard } from "@/components/shared/SummaryCard";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileWarning,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

export function ComplaintList() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const filters = useAppSelector((state) => state.complaints?.filters || {});
  const [searchValue, setSearchValue] = useState("");
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useComplaints(filters);
  const deleteMutation = useDeleteComplaint();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.MEMBER,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);
  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleCreate = () => router.push("/complaints/create");
  const handleEdit = (id: string) => router.push(`/complaints/edit/${id}`);
  const handleView = (id: string) => router.push(`/complaints/view/${id}`);
  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: "Are you sure you want to delete this complaint?", variant: "destructive" })) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSearch = (search: string) => {
    setSearchValue(search);
    dispatch(setFilters({ search, page: 1 }));
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }));
  };

  const handleStatusFilter = (statusId: string) => {
    if (statusId === "all") {
      dispatch(setFilters({ statusId: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ statusId, page: 1 }));
    }
  };

  const handlePriorityFilter = (compPriority: string) => {
    if (compPriority === "all") {
      dispatch(setFilters({ compPriority: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ compPriority: compPriority as any, page: 1 }));
    }
  };

  const handleMemberFilter = (memId: string) => {
    if (memId === "all") {
      dispatch(setFilters({ memId: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ memId, page: 1 }));
    }
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    dispatch(setFilters({ sortBy, sortOrder, page: 1 }));
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
        "File",
        "Category",
        "Title",
        "Priority",
        "Status",
        "Assigned To",
        "Date",
      ],
      ...(data?.items || []).map((item) => [
        typeof item.memId === "object" ? item.memId?.memName : "Unknown",
        typeof item.fileId === "object"
          ? item.fileId?.fileRegNo || item.fileId?.fileBarCode || "-"
          : "-",
        typeof item.compCatId === "object"
          ? item.compCatId?.categoryName
          : "Unknown",
        item.compTitle,
        item.compPriority,
        item.status ||
          (typeof item.statusId === "object" ? item.statusId?.statusName : "-"),
        typeof item.assignedTo === "object"
          ? `${item.assignedTo?.firstName} ${item.assignedTo?.lastName}`
          : "-",
        new Date(item.compDate).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tableConfig = {
    columns: complaintColumns,
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "all" },
          { label: "Open", value: "open" },
          { label: "In Progress", value: "in_progress" },
          { label: "Resolved", value: "resolved" },
          { label: "Closed", value: "closed" },
          { label: "Rejected", value: "rejected" },
        ],
        onChange: handleStatusFilter,
      },
      {
        id: "priority",
        label: "Priority",
        type: "select" as const,
        options: [
          { label: "All Priorities", value: "all" },
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
          { label: "Emergency", value: "emergency" },
        ],
        onChange: handlePriorityFilter,
      },
      {
        id: "sortBy",
        label: "Sort By",
        type: "select" as const,
        options: [
          { label: "Date", value: "compDate" },
          { label: "Title", value: "compTitle" },
          { label: "Priority", value: "compPriority" },
          { label: "Created", value: "createdAt" },
        ],
        onChange: (value: string) =>
          handleSortChange(value, filters.sortOrder || "desc"),
      },
      {
        id: "sortOrder",
        label: "Sort Order",
        type: "select" as const,
        options: [
          { label: "Ascending", value: "asc" },
          { label: "Descending", value: "desc" },
        ],
        onChange: (value: "asc" | "desc") =>
          handleSortChange(filters.sortBy || "compDate", value),
      },
    ],
    enableActions: true,
    enableSelection: true,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: canDelete ? handleDelete : undefined,
      customActions: [
        {
          label: "View",
          icon: <span>👁️</span>,
          onClick: (row: Complaint) => handleView(row._id),
          variant: "outline" as const,
        },
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
        <h1 className="text-2xl font-bold">Complaints</h1>
        <p className="text-muted-foreground">
          Manage and track member complaints
        </p>
      </div>

      {/* Summary Cards */}
        {data?.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Complaints"
              value={data.summary.total ?? 0}
              icon={FileWarning}
              iconBgClassName="bg-blue-100"
              iconClassName="text-blue-600"
            />
            <SummaryCard
              title="Open"
              value={data.summary.open ?? 0}
              icon={AlertCircle}
              iconBgClassName="bg-yellow-100"
              iconClassName="text-yellow-600"
              valueClassName="text-yellow-600"
            />
            <SummaryCard
              title="In Progress"
              value={data.summary.inProgress ?? 0}
              icon={Loader2}
              iconBgClassName="bg-orange-100"
              iconClassName="text-orange-600"
              valueClassName="text-orange-600"
            />
            <SummaryCard
              title="Resolved"
              value={data.summary.resolved ?? 0}
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
                Add Complaint
              </Button>
            )
          }
        />

      <Card>
        <CardHeader icon={FileWarning}>
          <CardTitle>Complaints</CardTitle>
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
    </div>
  );
}
