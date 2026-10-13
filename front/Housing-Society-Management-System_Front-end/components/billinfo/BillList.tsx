"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { billInfoColumns } from "@/lib/constants/billInfoColumns.constants";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useBills,
  useBillStats,
  useDeleteBill,
} from "@/lib/hooks/entities/useBillInfo";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetFilters, setFilters } from "@/lib/store/slices/billInfoSlice";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Download,
  FileText,
  Plus,
  RefreshCw,
  Receipt,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BillInfo } from "@/lib/types/billInfo";
import { formatCurrency } from "@/lib/utils/format";
import { PaymentModal } from "./PaymentModal";
import { GenerateBillsModal } from "./GenerateBillsModal";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function BillList() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const filters = useAppSelector((state) => state.bills?.filters || {});
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; bill: BillInfo | null }>({
    open: false,
    bill: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; bill: BillInfo | null }>({
    open: false,
    bill: null,
  });
  const [generateModal, setGenerateModal] = useState(false);

  const { data, isLoading } = useBills(filters);
  const { data: stats } = useBillStats();
  const deleteMutation = useDeleteBill();

  const canCreate =
    user && hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canUpdate =
    user && hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canDelete =
    user && hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleCreate = () => router.push("/billinfo/create");
  const handleEdit = (id: string) => router.push(`/billinfo/edit/${id}`);
  const handleView = (id: string) => router.push(`/billinfo/view/${id}`);

  const handleDeleteClick = (row: BillInfo) => {
    if (canDelete) setDeleteDialog({ open: true, bill: row });
  };
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.bill) return;
    await deleteMutation.mutateAsync(deleteDialog.bill._id);
    setDeleteDialog({ open: false, bill: null });
  };

  const handleRecordPayment = (row: BillInfo) => {
    if (canUpdate && row.status !== "Paid" && row.status !== "Cancelled")
      setPaymentModal({ open: true, bill: row });
  };

  const handleViewMemberBills = (row: BillInfo) => {
    const memId = typeof row.memId === "object" ? row.memId?._id : row.memId;
    if (memId) dispatch(setFilters({ memId, page: 1 }));
  };

  const handleViewFileBills = (row: BillInfo) => {
    const fileId = typeof row.fileId === "object" ? row.fileId?._id : row.fileId;
    if (fileId) dispatch(setFilters({ fileId, page: 1 }));
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
      dispatch(setFilters({ status: status as BillInfo["status"], page: 1 }));
    }
  };

  const handleMemberFilter = (memId: string) => {
    if (memId === "all") {
      dispatch(setFilters({ memId: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ memId, page: 1 }));
    }
  };

  const handleFileFilter = (fileId: string) => {
    if (fileId === "all") {
      dispatch(setFilters({ fileId: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ fileId, page: 1 }));
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
        "Bill No",
        "Member",
        "File",
        "Amount",
        "Paid",
        "Remaining",
        "Due Date",
        "Status",
        "Created",
      ],
      ...(data?.items || []).map((item) => [
        item.billNo,
        typeof item.memId === "object"
          ? (item.memId as { fullName?: string; memName?: string }).fullName ||
            (item.memId as { memName?: string }).memName ||
            "—"
          : "—",
        typeof item.fileId === "object"
          ? (item.fileId as { fileNo?: string; fileRegNo?: string }).fileNo ||
            (item.fileId as { fileRegNo?: string }).fileRegNo ||
            "—"
          : "—",
        item.totalPayable ?? item.billAmount,
        item.totalPaid ?? 0,
        item.remainingBalance ?? item.totalPayable,
        new Date(item.dueDate).toLocaleDateString(),
        item.status,
        new Date(item.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bills-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tableConfig = {
    columns: billInfoColumns,
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All", value: "all" },
          { label: "Paid", value: "Paid" },
          { label: "Pending", value: "Pending" },
          { label: "Overdue", value: "Overdue" },
          { label: "Partially Paid", value: "Partially Paid" },
        ],
        onChange: handleStatusFilter,
      },
      {
        id: "sortBy",
        label: "Sort By",
        type: "select" as const,
        options: [
          { label: "Due Date", value: "dueDate" },
          { label: "Amount", value: "billAmount" },
          { label: "Created", value: "createdAt" },
          { label: "Status", value: "status" },
        ],
        onChange: (value: string) =>
          handleSortChange(value, filters.sortOrder || "desc"),
      },
      {
        id: "sortOrder",
        label: "Order",
        type: "select" as const,
        options: [
          { label: "Ascending", value: "asc" },
          { label: "Descending", value: "desc" },
        ],
        onChange: (value: "asc" | "desc") =>
          handleSortChange(filters.sortBy || "dueDate", value),
      },
    ],
    enableActions: true,
    enableSelection: true,
    actions: {
      onEdit: canUpdate ? handleEdit : undefined,
      onDelete: undefined,
      customActions: [
        {
          label: "View",
          actionType: "view",
          onClick: (row: BillInfo) => handleView(row._id),
          variant: "outline" as const,
        },
        ...(canUpdate
          ? [
              {
                label: "Record Payment",
                actionType: "paid",
                onClick: handleRecordPayment,
                variant: "outline" as const,
              },
              {
                label: "View Member Bills",
                actionType: "view",
                onClick: handleViewMemberBills,
                variant: "outline" as const,
              },
              {
                label: "View File Bills",
                actionType: "view",
                onClick: handleViewFileBills,
                variant: "outline" as const,
              },
            ]
          : []),
        ...(canDelete
          ? [
              {
                label: "Delete",
                actionType: "delete",
                onClick: handleDeleteClick,
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
          onPageSizeChange: (size: number) =>
            dispatch(setFilters({ limit: size, page: 1 })),
          totalItems: data.pagination.total,
        }
      : undefined,
    responsive: { showMobileView: true, stickyHeader: true },
  };

  const outstandingAmount = (stats?.totalPending ?? 0) + (stats?.totalOverdue ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Bill Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage bills and payments</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard
            title="Total Bills"
            value={stats.totalBills ?? 0}
            icon={FileText}
            iconBgClassName="bg-blue-500/20"
            iconClassName="text-blue-400"
            gradient="from-blue-500/10 to-transparent"
          />
          <SummaryCard
            title="Paid Bills"
            value={stats.byStatus?.Paid ?? 0}
            icon={CheckCircle2}
            iconBgClassName="bg-emerald-500/20"
            iconClassName="text-emerald-400"
            valueClassName="text-emerald-400"
            gradient="from-emerald-500/10 to-transparent"
          />
          <SummaryCard
            title="Pending Bills"
            value={
              (stats.byStatus?.Pending ?? 0) +
              (stats.byStatus?.["Partially Paid"] ?? 0)
            }
            icon={Clock}
            iconBgClassName="bg-amber-500/20"
            iconClassName="text-amber-400"
            valueClassName="text-amber-400"
            gradient="from-amber-500/10 to-transparent"
          />
          <SummaryCard
            title="Overdue Bills"
            value={stats.byStatus?.Overdue ?? 0}
            icon={AlertCircle}
            iconBgClassName="bg-rose-500/20"
            iconClassName="text-rose-400"
            valueClassName="text-rose-400"
            gradient="from-rose-500/10 to-transparent"
          />
          <SummaryCard
            title="Total Amount"
            value={formatCurrency(stats.totalAmount ?? 0)}
            icon={Banknote}
            iconBgClassName="bg-indigo-500/20"
            iconClassName="text-indigo-400"
            gradient="from-indigo-500/10 to-transparent"
          />
          <SummaryCard
            title="Outstanding Amount"
            value={formatCurrency(outstandingAmount)}
            icon={AlertCircle}
            iconBgClassName="bg-amber-500/20"
            iconClassName="text-amber-400"
            valueClassName="text-amber-400"
            gradient="from-amber-500/10 to-transparent"
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              className="border-sky-500/50 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-400/60 transition-all"
            >
              <Download className="size-4" />
              Export
            </Button>
          </>
        }
        right={
          canCreate && (
            <>
              <Button variant="glass" size="sm" onClick={() => setGenerateModal(true)}>
                Generate Bills
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleCreate}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200"
              >
                <Plus className="size-4" />
                Add Bill
              </Button>
            </>
          )
        }
      />

      <Card>
        <CardHeader icon={Receipt}>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.items || []}
            className="text-sm"
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onSelectionChange={handleSelectionChange}
          />
        </CardContent>
      </Card>

      <GenerateBillsModal
        open={generateModal}
        onOpenChange={setGenerateModal}
        onSuccess={() => setGenerateModal(false)}
      />

      <PaymentModal
        open={paymentModal.open}
        onOpenChange={(open) =>
          setPaymentModal({ open, bill: open ? paymentModal.bill : null })
        }
        bill={paymentModal.bill}
        onSuccess={() =>
          setPaymentModal({ open: false, bill: null })
        }
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, bill: open ? deleteDialog.bill : null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill
              {deleteDialog.bill ? ` (${deleteDialog.bill.billNo})` : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
