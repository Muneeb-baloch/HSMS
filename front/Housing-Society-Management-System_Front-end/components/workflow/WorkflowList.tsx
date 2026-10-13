"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable } from "@/components/shared/DataTable/DataTable";
import { TableColumn } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useWorkflows,
  useDeleteWorkflow,
} from "@/lib/hooks/entities/useWorkflow";
import { Workflow } from "@/lib/types/workflow";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  resetFilters,
  setFilters,
} from "@/lib/store/slices/workflowSlice";
import { SummaryCard } from "@/components/shared/SummaryCard/SummaryCard";
import { formatDate } from "@/lib/utils/format";
import {
  Download,
  GitBranch,
  Loader2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const workflowColumns: TableColumn<Workflow>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    cell: (row) => (
      <div className="font-medium max-w-[200px] truncate" title={row.name}>
        {row.name}
      </div>
    ),
    width: "200",
  },
  {
    id: "triggerType",
    header: "Trigger Type",
    accessorKey: "triggerType",
    cell: (row) => (
      <Badge className="bg-blue-100 text-blue-800 capitalize">
        {row.triggerType.replace(/-/g, " ")}
      </Badge>
    ),
    width: "140",
  },
  {
    id: "triggerEntity",
    header: "Trigger Entity",
    accessorKey: "triggerEntity",
    cell: (row) => (
      <div className="font-medium capitalize">{row.triggerEntity}</div>
    ),
    width: "130",
  },
  {
    id: "stepsCount",
    header: "Steps",
    cell: (row) => (
      <div className="font-medium">{row.steps?.length || 0}</div>
    ),
    width: "80",
  },
  {
    id: "isActive",
    header: "Active",
    cell: (row) => (
      <Badge
        className={
          row.isActive
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }
      >
        {row.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
    width: "100",
  },
  {
    id: "version",
    header: "Version",
    accessorKey: "version",
    cell: (row) => <div className="font-medium">v{row.version}</div>,
    width: "80",
  },
  {
    id: "createdAt",
    header: "Created",
    accessorKey: "createdAt",
    sortable: true,
    cell: (row) => (
      <div className="font-medium">{formatDate(row.createdAt)}</div>
    ),
    width: "120",
  },
];

export function WorkflowList() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const filters = useAppSelector((state) => state.workflows?.filters || {});
  const [searchValue, setSearchValue] = useState("");
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useWorkflows(filters);
  const deleteMutation = useDeleteWorkflow();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleCreate = () => router.push("/workflows/create");
  const handleEdit = (id: string) => router.push(`/workflows/edit/${id}`);
  const handleView = (id: string) => router.push(`/workflows/view/${id}`);
  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: "Are you sure you want to delete this workflow?", variant: "destructive" })) {
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

  const handleTriggerEntityFilter = (triggerEntity: string) => {
    if (triggerEntity === "all") {
      dispatch(setFilters({ triggerEntity: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ triggerEntity, page: 1 }));
    }
  };

  const handleActiveFilter = (isActive: string) => {
    if (isActive === "all") {
      dispatch(setFilters({ isActive: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ isActive: isActive === "true", page: 1 }));
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
      ["Name", "Trigger Type", "Trigger Entity", "Steps", "Active", "Version", "Created"],
      ...(data?.items || []).map((item) => [
        item.name,
        item.triggerType,
        item.triggerEntity,
        String(item.steps?.length || 0),
        item.isActive ? "Active" : "Inactive",
        String(item.version),
        new Date(item.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflows-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const items = data?.items || [];
  const totalWorkflows = items.length;
  const activeWorkflows = items.filter((w) => w.isActive).length;
  const inactiveWorkflows = items.filter((w) => !w.isActive).length;

  const tableConfig = {
    columns: workflowColumns,
    filters: [
      {
        id: "triggerEntity",
        label: "Trigger Entity",
        type: "select" as const,
        options: [
          { label: "All Entities", value: "all" },
          { label: "Member", value: "member" },
          { label: "Plot", value: "plot" },
          { label: "Complaint", value: "complaint" },
          { label: "Application", value: "application" },
          { label: "Visitor", value: "visitor" },
          { label: "Facility", value: "facility" },
          { label: "File", value: "file" },
        ],
        onChange: handleTriggerEntityFilter,
      },
      {
        id: "isActive",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "all" },
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
        onChange: handleActiveFilter,
      },
      {
        id: "sortBy",
        label: "Sort By",
        type: "select" as const,
        options: [
          { label: "Created", value: "createdAt" },
          { label: "Name", value: "name" },
          { label: "Trigger Type", value: "triggerType" },
        ],
        onChange: (value: string) =>
          handleSortChange(value, (filters as any).sortOrder || "desc"),
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
          handleSortChange((filters as any).sortBy || "createdAt", value),
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
          onClick: (row: Workflow) => handleView(row._id),
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
        <h1 className="text-2xl font-bold">Workflows</h1>
        <p className="text-muted-foreground">
          Manage automation workflows and triggers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Workflows"
          value={totalWorkflows}
          icon={GitBranch}
          iconBgClassName="bg-blue-100"
          iconClassName="text-blue-600"
        />
        <SummaryCard
          title="Active"
          value={activeWorkflows}
          icon={Play}
          iconBgClassName="bg-green-100"
          iconClassName="text-green-600"
          valueClassName="text-green-600"
        />
        <SummaryCard
          title="Inactive"
          value={inactiveWorkflows}
          icon={Pause}
          iconBgClassName="bg-gray-100"
          iconClassName="text-gray-600"
          valueClassName="text-gray-600"
        />
      </div>

      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 3 && (
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
              Add Workflow
            </Button>
          )
        }
      />

      <Card>
        <CardHeader icon={WorkflowIcon}>
          <CardTitle>Workflows</CardTitle>
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
