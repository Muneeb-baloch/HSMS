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
  useVendors,
  useVerifyVendor,
  useSuspendVendor,
} from "@/lib/hooks/entities/useVendor";
import { VendorProfile } from "@/lib/types/vendor";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import {
  Plus,
  RefreshCw,
  Store,
  CheckCircle2,
  Clock,
  ShieldOff,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "active":
      return "success";
    case "pending-verification":
      return "warning";
    case "suspended":
      return "destructive";
    case "blacklisted":
      return "destructive";
    default:
      return "secondary";
  }
};

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-3 w-3 ${
          i <= Math.round(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const vendorColumns: TableColumn<VendorProfile>[] = [
  {
    id: "vendorName",
    header: "Vendor Name",
    accessorKey: "vendorName",
    sortable: true,
    cell: (row) => (
      <div>
        <div className="font-medium">{row.vendorName}</div>
        {row.companyName && (
          <div className="text-sm text-muted-foreground">{row.companyName}</div>
        )}
      </div>
    ),
  },
  {
    id: "vendorType",
    header: "Type",
    accessorKey: "vendorType",
    cell: (row) => (
      <span className="capitalize">
        {row.vendorType?.replace(/_/g, " ") || "N/A"}
      </span>
    ),
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    cell: (row) => row.email || "N/A",
  },
  {
    id: "phone",
    header: "Phone",
    accessorKey: "phone",
    cell: (row) => row.phone || "N/A",
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
    id: "rating",
    header: "Rating",
    cell: (row) => (
      <div className="flex items-center gap-2">
        {renderStars(row.rating)}
        <span className="text-sm text-muted-foreground">
          ({row.totalRatings})
        </span>
      </div>
    ),
  },
  {
    id: "contracts",
    header: "Contracts",
    cell: (row) => (
      <span>
        {row.completedContracts}/{row.totalContracts}
      </span>
    ),
  },
];

export function VendorList() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({});
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useVendors({ ...filters, page });
  const verifyMutation = useVerifyVendor();
  const suspendMutation = useSuspendVendor();

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleCreate = () => router.push("/vendors/create");
  const handleView = (id: string) => router.push(`/vendors/view/${id}`);
  const handleEdit = (id: string) => router.push(`/vendors/edit/${id}`);

  const handleVerify = async (row: VendorProfile) => {
    if (await confirm({ title: "Verify", description: "Are you sure you want to verify this vendor?" })) {
      try {
        await verifyMutation.mutateAsync(row._id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleSuspend = async (row: VendorProfile) => {
    if (await confirm({ title: "Suspend", description: "Are you sure you want to suspend this vendor?" })) {
      try {
        await suspendMutation.mutateAsync({ id: row._id });
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
  const totalVendors = data?.pagination?.total || 0;
  const activeCount = items.filter((v) => v.status === "active").length;
  const pendingCount = items.filter(
    (v) => v.status === "pending-verification"
  ).length;
  const suspendedCount = items.filter((v) => v.status === "suspended").length;

  const tableConfig = {
    columns: vendorColumns,
    filters: [
      {
        id: "vendorType",
        label: "Vendor Type",
        type: "select" as const,
        options: [
          { label: "All Types", value: "" },
          { label: "Contractor", value: "contractor" },
          { label: "Supplier", value: "supplier" },
          { label: "Service Provider", value: "service_provider" },
          { label: "Consultant", value: "consultant" },
          { label: "Maintenance", value: "maintenance" },
          { label: "Security", value: "security" },
          { label: "Cleaning", value: "cleaning" },
          { label: "Landscaping", value: "landscaping" },
          { label: "Other", value: "other" },
        ],
      },
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "" },
          { label: "Active", value: "active" },
          { label: "Pending Verification", value: "pending-verification" },
          { label: "Suspended", value: "suspended" },
          { label: "Blacklisted", value: "blacklisted" },
        ],
      },
    ],
    enableActions: true,
    actions: {
      onEdit: canManage
        ? (id: string) => handleEdit(id)
        : undefined,
      customActions: [
        {
          label: "View Details",
          icon: <span>👁️</span>,
          onClick: (row: VendorProfile) => handleView(row._id),
          variant: "outline" as const,
        },
        {
          label: "Verify",
          icon: <span>✅</span>,
          onClick: (row: VendorProfile) => handleVerify(row),
          variant: "secondary" as const,
          showWhen: (row: VendorProfile) =>
            row.status === "pending-verification" && !!canManage,
        },
        {
          label: "Suspend",
          icon: <span>🚫</span>,
          onClick: (row: VendorProfile) => handleSuspend(row),
          variant: "destructive" as const,
          showWhen: (row: VendorProfile) =>
            row.status === "active" && !!canManage,
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
        <h1 className="text-2xl font-bold">Vendor Management</h1>
        <p className="text-muted-foreground">
          Manage vendor profiles, verifications, and ratings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Vendors"
          value={totalVendors}
          icon={Store}
          iconBgClassName="bg-blue-500/20"
          iconClassName="text-blue-500"
        />
        <SummaryCard
          title="Active"
          value={activeCount}
          icon={CheckCircle2}
          iconBgClassName="bg-green-500/20"
          iconClassName="text-green-500"
          valueClassName="text-green-600"
          gradient="from-green-500/10 to-transparent"
        />
        <SummaryCard
          title="Pending Verification"
          value={pendingCount}
          icon={Clock}
          iconBgClassName="bg-yellow-500/20"
          iconClassName="text-yellow-500"
          valueClassName="text-yellow-600"
          gradient="from-yellow-500/10 to-transparent"
        />
        <SummaryCard
          title="Suspended"
          value={suspendedCount}
          icon={ShieldOff}
          iconBgClassName="bg-red-500/20"
          iconClassName="text-red-500"
          valueClassName="text-red-600"
          gradient="from-red-500/10 to-transparent"
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
              Register Vendor
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
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
