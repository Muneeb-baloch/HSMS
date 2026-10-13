"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable, TableColumn } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  usePaymentTransactions,
  usePaymentStats,
} from "@/lib/hooks/entities/usePaymentGateway";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Transaction {
  _id: string;
  transactionId: string;
  memberName?: string;
  memberId?: string | { _id: string; memName?: string };
  amount: number;
  gateway: string;
  status: string;
  payerName?: string;
  payerEmail?: string;
  createdAt: string;
  updatedAt?: string;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
  processing: "bg-orange-100 text-orange-800",
};

const gatewayColors: Record<string, string> = {
  jazzcash: "bg-red-100 text-red-800",
  easypaisa: "bg-green-100 text-green-800",
  stripe: "bg-purple-100 text-purple-800",
  bank_transfer: "bg-blue-100 text-blue-800",
  cash: "bg-gray-100 text-gray-800",
};

const paymentColumns: TableColumn<Transaction>[] = [
  {
    id: "transactionId",
    header: "Transaction ID",
    cell: (row) => (
      <span className="font-mono text-sm">{row.transactionId || row._id.slice(-8).toUpperCase()}</span>
    ),
    width: "150",
  },
  {
    id: "member",
    header: "Member",
    cell: (row) => {
      const memberName =
        typeof row.memberId === "object"
          ? row.memberId?.memName
          : row.memberName || row.payerName;
      return <span className="font-medium">{memberName || "---"}</span>;
    },
    width: "150",
    hideOnMobile: true,
  },
  {
    id: "amount",
    header: "Amount",
    cell: (row) => (
      <span className="font-semibold">{formatCurrency(row.amount)}</span>
    ),
    width: "120",
  },
  {
    id: "gateway",
    header: "Gateway",
    cell: (row) => (
      <Badge className={gatewayColors[row.gateway] || "bg-gray-100 text-gray-800"}>
        {row.gateway?.replace("_", " ").toUpperCase() || "N/A"}
      </Badge>
    ),
    width: "120",
    hideOnMobile: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <Badge className={statusColors[row.status] || "bg-gray-100 text-gray-800"}>
        {row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || "N/A"}
      </Badge>
    ),
    width: "110",
  },
  {
    id: "date",
    header: "Date",
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(row.createdAt)}
      </span>
    ),
    width: "160",
    hideOnMobile: true,
  },
];

export function PaymentList() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = usePaymentTransactions(filters);
  const { data: stats } = usePaymentStats(user?.societyId || "");

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleView = (id: string) => router.push(`/payment-gateway/view/${id}`);

  const handleSearch = (search: string) => {
    setSearchValue(search);
    setLocalFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    if (status === "all") {
      setLocalFilters((prev) => {
        const { status: _, ...rest } = prev as Record<string, unknown> & { status?: string };
        return { ...rest, page: 1 };
      });
    } else {
      setLocalFilters((prev) => ({ ...prev, status, page: 1 }));
    }
  };

  const handleGatewayFilter = (gateway: string) => {
    if (gateway === "all") {
      setLocalFilters((prev) => {
        const { gateway: _, ...rest } = prev as Record<string, unknown> & { gateway?: string };
        return { ...rest, page: 1 };
      });
    } else {
      setLocalFilters((prev) => ({ ...prev, gateway, page: 1 }));
    }
  };

  const handlePageChange = (page: number) => {
    setLocalFilters((prev) => ({ ...prev, page }));
  };

  const handleResetFilters = () => {
    setLocalFilters({ page: 1, limit: 20 });
    setSearchValue("");
    setSelectedIds([]);
  };

  const handleSelectionChange = (ids: string[]) => setSelectedIds(ids);

  const handleExportReport = () => {
    const csvData = [
      ["Transaction ID", "Member", "Amount", "Gateway", "Status", "Date"],
      ...(data?.items || []).map((item: Transaction) => [
        item.transactionId || item._id,
        typeof item.memberId === "object" ? item.memberId?.memName : item.memberName || item.payerName || "-",
        item.amount,
        item.gateway || "-",
        item.status || "-",
        new Date(item.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tableConfig = {
    columns: paymentColumns,
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "all" },
          { label: "Completed", value: "completed" },
          { label: "Pending", value: "pending" },
          { label: "Failed", value: "failed" },
          { label: "Refunded", value: "refunded" },
          { label: "Processing", value: "processing" },
        ],
        onChange: handleStatusFilter,
      },
      {
        id: "gateway",
        label: "Gateway",
        type: "select" as const,
        options: [
          { label: "All Gateways", value: "all" },
          { label: "JazzCash", value: "jazzcash" },
          { label: "EasyPaisa", value: "easypaisa" },
          { label: "Stripe", value: "stripe" },
          { label: "Bank Transfer", value: "bank_transfer" },
          { label: "Cash", value: "cash" },
        ],
        onChange: handleGatewayFilter,
      },
    ],
    enableActions: true,
    enableSelection: true,
    actions: {
      customActions: [
        {
          label: "View",
          icon: <span>👁️</span>,
          onClick: (row: Transaction) => handleView(row._id),
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
            setLocalFilters((prev) => ({ ...prev, limit: size, page: 1 })),
          totalItems: data.pagination.total,
        }
      : undefined,
    responsive: { showMobileView: true, stickyHeader: true },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment Gateway</h1>
        <p className="text-muted-foreground">
          Track and manage payment transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Collected"
          value={stats?.totalCollected ? formatCurrency(stats.totalCollected) : "PKR 0.00"}
          icon={CheckCircle2}
          iconBgClassName="bg-green-100"
          iconClassName="text-green-600"
          valueClassName="text-green-600"
          gradient="from-green-500/10 to-transparent"
        />
        <SummaryCard
          title="Pending"
          value={stats?.totalPending ? formatCurrency(stats.totalPending) : "PKR 0.00"}
          icon={Loader2}
          iconBgClassName="bg-yellow-100"
          iconClassName="text-yellow-600"
          valueClassName="text-yellow-600"
          gradient="from-yellow-500/10 to-transparent"
        />
        <SummaryCard
          title="Failed"
          value={stats?.totalFailed ? formatCurrency(stats.totalFailed) : "PKR 0.00"}
          icon={XCircle}
          iconBgClassName="bg-red-100"
          iconClassName="text-red-600"
          valueClassName="text-red-600"
          gradient="from-red-500/10 to-transparent"
        />
        <SummaryCard
          title="Refunded"
          value={stats?.totalRefunded ? formatCurrency(stats.totalRefunded) : "PKR 0.00"}
          icon={RotateCcw}
          iconBgClassName="bg-blue-100"
          iconClassName="text-blue-600"
          valueClassName="text-blue-600"
          gradient="from-blue-500/10 to-transparent"
        />
      </div>

      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 2 && (
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
      />

      <Card>
        <CardHeader icon={CreditCard}>
          <CardTitle>Transactions</CardTitle>
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
