"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable } from "@/components/shared/DataTable/DataTable";
import { TableColumn } from "@/components/shared/DataTable/DataTable";
import { SummaryCard } from "@/components/shared/SummaryCard/SummaryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useWorkOrders,
  useDeleteWorkOrder,
} from "@/lib/hooks/entities/useVendor";
import { WorkOrder } from "@/lib/types/vendor";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import { formatDate } from "@/lib/utils/format";
import {
  Plus,
  RefreshCw,
  ClipboardList,
  FolderOpen,
  Hammer,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "open":
      return "success";
    case "bidding":
      return "warning";
    case "awarded":
    case "in-progress":
      return "default";
    case "completed":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "draft":
      return "outline" as "secondary";
    default:
      return "secondary";
  }
};

const workOrderColumns: TableColumn<WorkOrder>[] = [
  {
    id: "title",
    header: "Title",
    accessorKey: "title",
    sortable: true,
    cell: (row) => (
      <div>
        <div className="font-medium">{row.title}</div>
        <div className="text-sm text-muted-foreground capitalize">
          {row.category?.replace(/_/g, " ") || "N/A"}
        </div>
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    accessorKey: "category",
    cell: (row) => (
      <span className="capitalize">
        {row.category?.replace(/_/g, " ") || "N/A"}
      </span>
    ),
  },
  {
    id: "estimatedBudget",
    header: "Budget",
    cell: (row) =>
      row.estimatedBudget
        ? `$${row.estimatedBudget.toLocaleString()}`
        : "N/A",
  },
  {
    id: "deadline",
    header: "Deadline",
    cell: (row) => formatDate(row.deadline),
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <Badge variant={getStatusVariant(row.status)}>
        {row.status?.replace(/-/g, " ").toUpperCase() || "N/A"}
      </Badge>
    ),
  },
  {
    id: "bids",
    header: "Bids",
    cell: (row) => (
      <span className="font-medium">{row.bids?.length || 0}</span>
    ),
  },
  {
    id: "awardedTo",
    header: "Awarded To",
    cell: (row) => {
      if (!row.awardedVendorId) return "N/A";
      if (typeof row.awardedVendorId === "object") {
        return row.awardedVendorId.vendorName || "N/A";
      }
      return "Assigned";
    },
  },
];

export function WorkOrderList() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({});
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useWorkOrders({ ...filters, page });
  const deleteMutation = useDeleteWorkOrder();

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleCreate = () => router.push("/work-orders/create");
  const handleView = (id: string) => router.push(`/work-orders/view/${id}`);
  const handleEdit = (id: string) => router.push(`/work-orders/edit/${id}`);

  const handleDelete = async (id: string) => {
    if (canManage && await confirm({ title: "Delete", description: "Are you sure you want to delete this work order?", variant: "destructive" })) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleSearch = (search: string) => {
    setLocalFilters((prev) => ({ ...prev, search }));
    setPage(1);
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const items = data?.items || [];
  const totalOrders = data?.pagination?.total || 0;
  const openCount = items.filter((o) => o.status === "open").length;
  const inProgressCount = items.filter(
    (o) => o.status === "in-progress"
  ).length;
  const completedCount = items.filter((o) => o.status === "completed").length;

  const tableConfig = {
    columns: workOrderColumns,
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "" },
          { label: "Draft", value: "draft" },
          { label: "Open", value: "open" },
          { label: "Bidding", value: "bidding" },
          { label: "Awarded", value: "awarded" },
          { label: "In Progress", value: "in-progress" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
        ],
      },
      {
        id: "category",
        label: "Category",
        type: "select" as const,
        options: [
          { label: "All Categories", value: "" },
          { label: "Plumbing", value: "plumbing" },
          { label: "Electrical", value: "electrical" },
          { label: "Construction", value: "construction" },
          { label: "Painting", value: "painting" },
          { label: "Landscaping", value: "landscaping" },
          { label: "Cleaning", value: "cleaning" },
          { label: "Security", value: "security" },
          { label: "HVAC", value: "hvac" },
          { label: "General Maintenance", value: "general_maintenance" },
          { label: "Other", value: "other" },
        ],
      },
    ],
    enableActions: true,
    actions: {
      onEdit: canManage ? (id: string) => handleEdit(id) : undefined,
      onDelete: canManage ? handleDelete : undefined,
      customActions: [
        {
          label: "View Details",
          icon: <span>👁️</span>,
          onClick: (row: WorkOrder) => handleView(row._id),
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
          onPageSizeChange: (size: number) => {
            setLocalFilters((prev) => ({ ...prev, limit: size }));
            setPage(1);
          },
          totalItems: data.pagination.total,
        }
      : undefined,
    responsive: { showMobileView: true, stickyHeader: true },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <p className="text-muted-foreground">
          Manage work orders, bids, and assignments
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Orders"
          value={totalOrders}
          icon={ClipboardList}
          iconBgClassName="bg-blue-500/20"
          iconClassName="text-blue-500"
        />
        <SummaryCard
          title="Open"
          value={openCount}
          icon={FolderOpen}
          iconBgClassName="bg-green-500/20"
          iconClassName="text-green-500"
          valueClassName="text-green-600"
          gradient="from-green-500/10 to-transparent"
        />
        <SummaryCard
          title="In Progress"
          value={inProgressCount}
          icon={Hammer}
          iconBgClassName="bg-orange-500/20"
          iconClassName="text-orange-500"
          valueClassName="text-orange-600"
          gradient="from-orange-500/10 to-transparent"
        />
        <SummaryCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
          iconBgClassName="bg-emerald-500/20"
          iconClassName="text-emerald-500"
          valueClassName="text-emerald-600"
          gradient="from-emerald-500/10 to-transparent"
        />
      </div>

      <ActionBar
        left={
          <Button variant="glass" size="sm" onClick={() => refetch()}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
        right={
          canManage && (
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus className="size-4" />
              New Work Order
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={items}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
