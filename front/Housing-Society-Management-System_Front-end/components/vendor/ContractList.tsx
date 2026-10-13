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
  useVendorContracts,
  useTerminateContract,
  useRenewContract,
} from "@/lib/hooks/entities/useVendor";
import { VendorContract } from "@/lib/types/vendor";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import { formatDate } from "@/lib/utils/format";
import {
  Plus,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "active":
      return "success";
    case "draft":
      return "secondary";
    case "expired":
      return "warning";
    case "terminated":
      return "destructive";
    case "renewed":
      return "default";
    default:
      return "secondary";
  }
};

const contractColumns: TableColumn<VendorContract>[] = [
  {
    id: "contractName",
    header: "Contract Name",
    accessorKey: "contractName",
    sortable: true,
    cell: (row) => <div className="font-medium">{row.contractName}</div>,
  },
  {
    id: "vendor",
    header: "Vendor",
    cell: (row) => {
      if (typeof row.vendorId === "object") {
        return (row.vendorId as { vendorName?: string }).vendorName || "N/A";
      }
      return "N/A";
    },
  },
  {
    id: "amount",
    header: "Amount",
    cell: (row) =>
      row.amount ? `$${row.amount.toLocaleString()}` : "N/A",
  },
  {
    id: "startDate",
    header: "Start Date",
    cell: (row) => formatDate(row.startDate),
    sortable: true,
  },
  {
    id: "endDate",
    header: "End Date",
    cell: (row) => formatDate(row.endDate),
    sortable: true,
  },
  {
    id: "paymentFrequency",
    header: "Frequency",
    cell: (row) => (
      <span className="capitalize">
        {row.paymentFrequency?.replace(/-/g, " ") || "N/A"}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <Badge variant={getStatusVariant(row.status)}>
        {row.status?.toUpperCase() || "N/A"}
      </Badge>
    ),
  },
  {
    id: "autoRenew",
    header: "Auto-Renew",
    cell: (row) => (
      <Badge variant={row.autoRenew ? "success" : "secondary"}>
        {row.autoRenew ? "YES" : "NO"}
      </Badge>
    ),
  },
];

export function ContractList() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useVendorContracts({
    ...filters,
    page,
  });
  const terminateMutation = useTerminateContract();
  const renewMutation = useRenewContract();

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleCreate = () => router.push("/vendor-contracts/create");
  const handleView = (id: string) =>
    router.push(`/vendor-contracts/view/${id}`);
  const handleEdit = (id: string) =>
    router.push(`/vendor-contracts/edit/${id}`);

  const handleTerminate = async (row: VendorContract) => {
    const reason = prompt("Enter termination reason:");
    if (reason) {
      try {
        await terminateMutation.mutateAsync({ id: row._id, data: { reason } });
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleRenew = async (row: VendorContract) => {
    const newEndDate = prompt("Enter new end date (YYYY-MM-DD):");
    if (newEndDate) {
      try {
        await renewMutation.mutateAsync({
          id: row._id,
          data: { endDate: newEndDate },
        });
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
  const totalContracts = data?.pagination?.total || 0;
  const activeCount = items.filter((c) => c.status === "active").length;
  const expiredCount = items.filter((c) => c.status === "expired").length;
  const terminatedCount = items.filter(
    (c) => c.status === "terminated"
  ).length;

  const tableConfig = {
    columns: contractColumns,
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "" },
          { label: "Draft", value: "draft" },
          { label: "Active", value: "active" },
          { label: "Expired", value: "expired" },
          { label: "Terminated", value: "terminated" },
          { label: "Renewed", value: "renewed" },
        ],
      },
    ],
    enableActions: true,
    actions: {
      onEdit: canManage ? (id: string) => handleEdit(id) : undefined,
      customActions: [
        {
          label: "View Details",
          icon: <span>👁️</span>,
          onClick: (row: VendorContract) => handleView(row._id),
          variant: "outline" as const,
        },
        {
          label: "Terminate",
          icon: <span>🚫</span>,
          onClick: (row: VendorContract) => handleTerminate(row),
          variant: "destructive" as const,
          showWhen: (row: VendorContract) =>
            row.status === "active" && !!canManage,
        },
        {
          label: "Renew",
          icon: <span>🔄</span>,
          onClick: (row: VendorContract) => handleRenew(row),
          variant: "secondary" as const,
          showWhen: (row: VendorContract) =>
            (row.status === "active" || row.status === "expired") &&
            !!canManage,
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
        <h1 className="text-2xl font-bold">Vendor Contracts</h1>
        <p className="text-muted-foreground">
          Manage vendor contracts, renewals, and performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Contracts"
          value={totalContracts}
          icon={FileText}
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
          title="Expired"
          value={expiredCount}
          icon={Clock}
          iconBgClassName="bg-yellow-500/20"
          iconClassName="text-yellow-500"
          valueClassName="text-yellow-600"
          gradient="from-yellow-500/10 to-transparent"
        />
        <SummaryCard
          title="Terminated"
          value={terminatedCount}
          icon={XCircle}
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
              New Contract
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
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
