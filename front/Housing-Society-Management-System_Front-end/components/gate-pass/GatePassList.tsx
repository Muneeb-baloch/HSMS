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
  useGatePasses,
  useDeleteGatePass,
} from "@/lib/hooks/entities/useGatePass";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/format";
import { truncateText } from "@/lib/utils/format";
import { customToast } from "@/lib/utils/customToast";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "requested":
      return "secondary";
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    case "checked_in":
      return "warning";
    case "checked_out":
      return "default";
    case "cancelled":
      return "destructive";
    case "expired":
      return "secondary";
    default:
      return "secondary";
  }
};

const getTypeVariant = (
  type: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (type) {
    case "material_in":
    case "furniture_in":
    case "moving_in":
      return "success";
    case "material_out":
    case "furniture_out":
    case "moving_out":
      return "warning";
    case "construction_material":
      return "default";
    case "delivery_large":
      return "secondary";
    default:
      return "secondary";
  }
};

const gatePassColumns: TableColumn<any>[] = [
  {
    id: "passNumber",
    header: "Pass #",
    cell: (row) => (
      <span className="font-mono text-sm font-medium">
        {row.passNumber || row._id?.slice(-6).toUpperCase()}
      </span>
    ),
    sortable: true,
  },
  {
    id: "passType",
    header: "Type",
    cell: (row) => (
      <Badge variant={getTypeVariant(row.passType)}>
        {row.passType?.replace(/_/g, " ").toUpperCase() || "N/A"}
      </Badge>
    ),
  },
  {
    id: "description",
    header: "Description",
    cell: (row) => (
      <span className="text-sm">
        {truncateText(row.description || "", 40)}
      </span>
    ),
  },
  {
    id: "vehicleNumber",
    header: "Vehicle #",
    accessorKey: "vehicleNumber",
    cell: (row) => row.vehicleNumber || "N/A",
  },
  {
    id: "driverName",
    header: "Driver",
    accessorKey: "driverName",
    cell: (row) => row.driverName || "N/A",
  },
  {
    id: "expectedDate",
    header: "Expected Date",
    cell: (row) => formatDate(row.expectedDate),
    sortable: true,
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
    id: "passCode",
    header: "Pass Code",
    cell: (row) => (
      <span className="font-mono text-sm font-bold">
        {row.passCode || "N/A"}
      </span>
    ),
  },
];

export function GatePassList() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({});
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "my" | "today">("all");

  const { data, isLoading, refetch } = useGatePasses({ ...filters, page });
  const deleteMutation = useDeleteGatePass();

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

  const isGuard =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleCreate = () => router.push("/gate-passes/create");
  const handleView = (id: string) => router.push(`/gate-passes/view/${id}`);

  const handleDelete = async (id: string) => {
    if (
      canManage &&
      await confirm({ title: "Delete", description: "Are you sure you want to delete this gate pass?", variant: "destructive" })
    ) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        customToast.error("Failed to delete gate pass");
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
  const requestedCount = items.filter(
    (p: any) => p.status === "requested"
  ).length;
  const approvedCount = items.filter(
    (p: any) => p.status === "approved"
  ).length;
  const checkedInCount = items.filter(
    (p: any) => p.status === "checked_in"
  ).length;
  const todayCount = items.filter((p: any) => {
    if (!p.expectedDate) return false;
    const today = new Date().toDateString();
    return new Date(p.expectedDate).toDateString() === today;
  }).length;

  const tableConfig = {
    columns: gatePassColumns,
    filters: [
      {
        id: "type",
        label: "Pass Type",
        type: "select" as const,
        options: [
          { label: "All Types", value: "" },
          { label: "Material In", value: "material_in" },
          { label: "Material Out", value: "material_out" },
          { label: "Furniture In", value: "furniture_in" },
          { label: "Furniture Out", value: "furniture_out" },
          { label: "Construction Material", value: "construction_material" },
          { label: "Large Delivery", value: "delivery_large" },
          { label: "Moving In", value: "moving_in" },
          { label: "Moving Out", value: "moving_out" },
        ],
      },
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Statuses", value: "" },
          { label: "Requested", value: "requested" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Checked In", value: "checked_in" },
          { label: "Checked Out", value: "checked_out" },
          { label: "Cancelled", value: "cancelled" },
          { label: "Expired", value: "expired" },
        ],
      },
    ],
    enableActions: true,
    actions: {
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
        <h1 className="text-2xl font-bold">Gate Passes</h1>
        <p className="text-muted-foreground">
          Manage material and vehicle gate passes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
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
              Requested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {requestedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {checkedInCount}
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
            setLocalFilters({ myPasses: true });
            setPage(1);
          }}
        >
          My Passes
        </Button>
        {isGuard && (
          <Button
            variant={activeTab === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("today");
              const today = new Date().toISOString().split("T")[0];
              setLocalFilters({ startDate: today, endDate: today });
              setPage(1);
            }}
          >
            <CalendarDays className="size-4 mr-1" />
            Today&apos;s Passes
          </Button>
        )}
        {canManage && (
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("all");
              setLocalFilters({});
              setPage(1);
            }}
          >
            All Passes
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
              Request Gate Pass
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "my"
              ? "My Passes"
              : activeTab === "today"
              ? "Today's Passes"
              : "All Gate Passes"}
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
