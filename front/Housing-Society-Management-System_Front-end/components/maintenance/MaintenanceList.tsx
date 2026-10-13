"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import {
  EnhancedDataTable as DataTable,
  TableColumn,
} from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useMaintenanceRequests,
  useDeleteMaintenanceRequest,
} from "@/lib/hooks/entities/useMaintenanceRequest";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/format";
import { customToast } from "@/lib/utils/customToast";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flag,
  Loader2,
  Plus,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getPriorityVariant = (
  priority: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (priority) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
      return "default";
    case "urgent":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "submitted":
      return "secondary";
    case "acknowledged":
      return "default";
    case "in_progress":
      return "warning";
    case "completed":
      return "success";
    case "verified":
      return "success";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

const maintenanceColumns: TableColumn<any>[] = [
  {
    id: "requestNumber",
    header: "Request #",
    cell: (row) => (
      <span className="font-mono text-sm font-medium">
        {row.requestNumber || row._id?.slice(-6).toUpperCase()}
      </span>
    ),
    sortable: true,
  },
  {
    id: "title",
    header: "Title",
    accessorKey: "title",
    sortable: true,
    cell: (row) => <span className="font-medium">{row.title}</span>,
  },
  {
    id: "category",
    header: "Category",
    cell: (row) => (
      <Badge variant="secondary">
        {row.category?.replace(/_/g, " ").toUpperCase() || "N/A"}
      </Badge>
    ),
  },
  {
    id: "priority",
    header: "Priority",
    cell: (row) => (
      <Badge variant={getPriorityVariant(row.priority)}>
        {row.priority?.toUpperCase() || "N/A"}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <Badge variant={getStatusVariant(row.status)}>
        {row.status?.replace(/_/g, " ").toUpperCase() || "N/A"}
      </Badge>
    ),
  },
  {
    id: "location",
    header: "Location",
    accessorKey: "location",
    cell: (row) => row.location || "N/A",
  },
  {
    id: "assignedTo",
    header: "Assigned To",
    cell: (row) => {
      const assigned =
        typeof row.assignedTo === "object" ? row.assignedTo : null;
      return assigned
        ? assigned.memName || assigned.firstName || "Assigned"
        : "Unassigned";
    },
  },
  {
    id: "slaDeadline",
    header: "SLA Deadline",
    cell: (row) => formatDate(row.slaDeadline),
    sortable: true,
  },
  {
    id: "isOverdue",
    header: "Overdue",
    cell: (row) =>
      row.isOverdue ? (
        <Flag className="h-4 w-4 text-red-500" />
      ) : null,
  },
];

export function MaintenanceList() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({});
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

  const { data, isLoading, refetch } = useMaintenanceRequests({
    ...filters,
    page,
  });
  const deleteMutation = useDeleteMaintenanceRequest();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleCreate = () => router.push("/maintenance-requests/create");
  const handleView = (id: string) =>
    router.push(`/maintenance-requests/view/${id}`);
  const handleEdit = (id: string) =>
    router.push(`/maintenance-requests/edit/${id}`);

  const handleDelete = async (id: string) => {
    if (
      canManage &&
      await confirm({ title: "Delete", description: "Are you sure you want to delete this request?", variant: "destructive" })
    ) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        customToast.error("Failed to delete request");
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
  const totalCount = data?.pagination?.total || items.length;
  const submittedCount = items.filter(
    (r: any) => r.status === "submitted"
  ).length;
  const inProgressCount = items.filter(
    (r: any) => r.status === "in_progress"
  ).length;
  const overdueCount = items.filter((r: any) => r.isOverdue).length;
  const completedCount = items.filter(
    (r: any) => r.status === "completed" || r.status === "verified"
  ).length;

  const tableConfig = {
    columns: maintenanceColumns,
    filters: [
      {
        id: "category",
        label: "Category",
        type: "select" as const,
        options: [
          { label: "All Categories", value: "" },
          { label: "Plumbing", value: "plumbing" },
          { label: "Electrical", value: "electrical" },
          { label: "Carpentry", value: "carpentry" },
          { label: "Painting", value: "painting" },
          { label: "Pest Control", value: "pest_control" },
          { label: "HVAC", value: "hvac" },
          { label: "Elevator", value: "elevator" },
          { label: "Generator", value: "generator" },
          { label: "Water Supply", value: "water_supply" },
          { label: "Sewerage", value: "sewerage" },
          { label: "Road Repair", value: "road_repair" },
          { label: "Landscaping", value: "landscaping" },
          { label: "Security Equipment", value: "security_equipment" },
          { label: "Other", value: "other" },
        ],
      },
      {
        id: "priority",
        label: "Priority",
        type: "select" as const,
        options: [
          { label: "All Priorities", value: "" },
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
          { label: "Urgent", value: "urgent" },
        ],
      },
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Statuses", value: "" },
          { label: "Submitted", value: "submitted" },
          { label: "Acknowledged", value: "acknowledged" },
          { label: "In Progress", value: "in_progress" },
          { label: "Completed", value: "completed" },
          { label: "Verified", value: "verified" },
          { label: "Rejected", value: "rejected" },
        ],
      },
    ],
    enableActions: true,
    actions: {
      onEdit: canManage ? handleEdit : undefined,
      onDelete: canManage ? handleDelete : undefined,
      customActions: [
        {
          label: "View Details",
          icon: <span>👁</span>,
          onClick: (row: any) => handleView(row._id),
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
    responsive: {
      showMobileView: true,
      stickyHeader: true,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <p className="text-muted-foreground">
          Track and manage maintenance work requests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {submittedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inProgressCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "my" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveTab("my");
            setLocalFilters((prev) => ({ ...prev, myRequests: true }));
            setPage(1);
          }}
        >
          My Requests
        </Button>
        {canManage && (
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("all");
              setLocalFilters((prev) => {
                const next = { ...prev };
                delete next.myRequests;
                return next;
              });
              setPage(1);
            }}
          >
            All Requests
          </Button>
        )}
      </div>

      <ActionBar
        left={
          <Button variant="glass" size="sm" onClick={() => refetch()}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
        right={
          canCreate && (
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus className="size-4" />
              Create Request
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "my" ? "My Requests" : "All Requests"}
          </CardTitle>
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
