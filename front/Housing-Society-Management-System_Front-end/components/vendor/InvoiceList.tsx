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
  useVendorInvoices,
  useApproveInvoice,
  useRejectInvoice,
  useMarkInvoicePaid,
} from "@/lib/hooks/entities/useVendor";
import { VendorInvoice } from "@/lib/types/vendor";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import { formatDate } from "@/lib/utils/format";
import {
  Plus,
  RefreshCw,
  Receipt,
  Clock,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "submitted":
      return "secondary";
    case "under-review":
      return "warning";
    case "approved":
      return "success";
    case "paid":
      return "default";
    case "rejected":
      return "destructive";
    case "disputed":
      return "destructive";
    default:
      return "secondary";
  }
};

const invoiceColumns: TableColumn<VendorInvoice>[] = [
  {
    id: "invoiceNumber",
    header: "Invoice #",
    accessorKey: "invoiceNumber",
    sortable: true,
    cell: (row) => (
      <span className="font-mono font-medium">{row.invoiceNumber}</span>
    ),
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
    cell: (row) => `$${row.amount?.toLocaleString() || "0"}`,
  },
  {
    id: "taxAmount",
    header: "Tax",
    cell: (row) => `$${row.taxAmount?.toLocaleString() || "0"}`,
  },
  {
    id: "totalAmount",
    header: "Total",
    cell: (row) => (
      <span className="font-medium">
        ${row.totalAmount?.toLocaleString() || "0"}
      </span>
    ),
  },
  {
    id: "dueDate",
    header: "Due Date",
    cell: (row) => formatDate(row.dueDate),
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
    id: "paymentDate",
    header: "Payment Date",
    cell: (row) => (row.paymentDate ? formatDate(row.paymentDate) : "--"),
  },
];

export function InvoiceList() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({});
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useVendorInvoices({
    ...filters,
    page,
  });
  const approveMutation = useApproveInvoice();
  const rejectMutation = useRejectInvoice();
  const markPaidMutation = useMarkInvoicePaid();

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleCreate = () => router.push("/vendor-invoices/create");
  const handleView = (id: string) =>
    router.push(`/vendor-invoices/view/${id}`);

  const handleApprove = async (row: VendorInvoice) => {
    if (await confirm({ title: "Approve", description: "Are you sure you want to approve this invoice?" })) {
      try {
        await approveMutation.mutateAsync(row._id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleReject = async (row: VendorInvoice) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await rejectMutation.mutateAsync({ id: row._id, data: { reason } });
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleMarkPaid = async (row: VendorInvoice) => {
    const paymentReference = prompt("Enter payment reference:");
    if (paymentReference) {
      try {
        await markPaidMutation.mutateAsync({
          id: row._id,
          data: { paymentReference },
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
  const totalInvoices = data?.pagination?.total || 0;
  const pendingCount = items.filter(
    (i) => i.status === "submitted" || i.status === "under-review"
  ).length;
  const approvedCount = items.filter((i) => i.status === "approved").length;
  const paidCount = items.filter((i) => i.status === "paid").length;

  const tableConfig = {
    columns: invoiceColumns,
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "" },
          { label: "Submitted", value: "submitted" },
          { label: "Under Review", value: "under-review" },
          { label: "Approved", value: "approved" },
          { label: "Paid", value: "paid" },
          { label: "Rejected", value: "rejected" },
          { label: "Disputed", value: "disputed" },
        ],
      },
    ],
    enableActions: true,
    actions: {
      customActions: [
        {
          label: "View Details",
          icon: <span>👁️</span>,
          onClick: (row: VendorInvoice) => handleView(row._id),
          variant: "outline" as const,
        },
        {
          label: "Approve",
          icon: <span>✅</span>,
          onClick: (row: VendorInvoice) => handleApprove(row),
          variant: "secondary" as const,
          showWhen: (row: VendorInvoice) =>
            (row.status === "submitted" || row.status === "under-review") &&
            !!canManage,
        },
        {
          label: "Reject",
          icon: <span>❌</span>,
          onClick: (row: VendorInvoice) => handleReject(row),
          variant: "destructive" as const,
          showWhen: (row: VendorInvoice) =>
            (row.status === "submitted" || row.status === "under-review") &&
            !!canManage,
        },
        {
          label: "Mark Paid",
          icon: <span>💰</span>,
          onClick: (row: VendorInvoice) => handleMarkPaid(row),
          variant: "secondary" as const,
          showWhen: (row: VendorInvoice) =>
            row.status === "approved" && !!canManage,
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
        <h1 className="text-2xl font-bold">Vendor Invoices</h1>
        <p className="text-muted-foreground">
          Manage vendor invoices, approvals, and payments
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Invoices"
          value={totalInvoices}
          icon={Receipt}
          iconBgClassName="bg-blue-500/20"
          iconClassName="text-blue-500"
        />
        <SummaryCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          iconBgClassName="bg-yellow-500/20"
          iconClassName="text-yellow-500"
          valueClassName="text-yellow-600"
          gradient="from-yellow-500/10 to-transparent"
        />
        <SummaryCard
          title="Approved"
          value={approvedCount}
          icon={CheckCircle2}
          iconBgClassName="bg-green-500/20"
          iconClassName="text-green-500"
          valueClassName="text-green-600"
          gradient="from-green-500/10 to-transparent"
        />
        <SummaryCard
          title="Paid"
          value={paidCount}
          icon={DollarSign}
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
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <Plus className="size-4" />
            Submit Invoice
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
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
