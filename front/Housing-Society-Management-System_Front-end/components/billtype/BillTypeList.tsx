"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillTypeSummaryCards } from "@/components/billtype/BillTypeSummaryCards";
import { billTypeColumns } from "@/lib/constants/billTypeColumns.constants";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useBillTypes,
  useDeleteBillType,
  useValidateBillType,
  useCalculateAmount,
} from "@/lib/hooks/entities/useBillType";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetFilters, setFilters } from "@/lib/store/slices/billTypeSlice";
import { FileType } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, CheckCircle2, Download, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BillType } from "@/lib/types/billType";
import { customToast } from "@/lib/utils/customToast";

export function BillTypeList() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const filters = useAppSelector((state) => state.billTypes?.filters || {});
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; billType: BillType | null }>({
    open: false,
    billType: null,
  });
  const [validateDialog, setValidateDialog] = useState<{
    open: boolean;
    billType: BillType | null;
    result?: { isValid: boolean; issues: string[]; suggestions: string[] };
  }>({ open: false, billType: null });
  const [calculateDialog, setCalculateDialog] = useState<{
    open: boolean;
    billType: BillType | null;
  }>({ open: false, billType: null });
  const [calcUnits, setCalcUnits] = useState("");
  const [calcBaseAmount, setCalcBaseAmount] = useState("");

  const { data, isLoading } = useBillTypes(filters);
  const deleteMutation = useDeleteBillType();
  const validateMutation = useValidateBillType();
  const calculateMutation = useCalculateAmount();

  const canCreate =
    user && hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canUpdate =
    user && hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canDelete =
    user && hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleCreate = () => router.push("/billtype/create");
  const handleEdit = (id: string) => router.push(`/billtype/edit/${id}`);
  const handleView = (id: string) => router.push(`/billtype/view/${id}`);

  const handleDeleteClick = (row: BillType) => {
    if (canDelete) setDeleteDialog({ open: true, billType: row });
  };
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.billType) return;
    await deleteMutation.mutateAsync(deleteDialog.billType._id);
    setDeleteDialog({ open: false, billType: null });
  };

  const handleValidateClick = (row: BillType) => {
    if (canUpdate) setValidateDialog({ open: true, billType: row });
  };
  const handleValidateRun = async () => {
    if (!validateDialog.billType) return;
    try {
      const result = await validateMutation.mutateAsync(validateDialog.billType._id);
      setValidateDialog((p) => ({ ...p, result }));
      if (result.isValid) customToast.success("Configuration is valid");
    } catch {
      // toast in mutation
    }
  };

  const handleCalculateClick = (row: BillType) => {
    if (canUpdate) {
      setCalculateDialog({ open: true, billType: row });
      setCalcUnits("");
      setCalcBaseAmount("");
    }
  };
  const handleCalculateRun = async () => {
    if (!calculateDialog.billType) return;
    try {
      const units = calcUnits ? parseFloat(calcUnits) : undefined;
      const baseAmount = calcBaseAmount ? parseFloat(calcBaseAmount) : undefined;
      const result = await calculateMutation.mutateAsync({
        billTypeId: calculateDialog.billType._id,
        units,
        baseAmount,
      });
      customToast.success(
        `Amount: Rs ${result.totalAmount.toLocaleString()} (Base: ${result.baseAmount}, Tax: ${result.taxAmount})`
      );
    } catch {
      // toast in mutation
    }
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
      dispatch(setFilters({ isActive: undefined, page: 1 }));
    } else if (status === "true") {
      dispatch(setFilters({ isActive: true, page: 1 }));
    } else {
      dispatch(setFilters({ isActive: false, page: 1 }));
    }
  };

  const handleCategoryFilter = (category: string) => {
    if (category === "all") {
      dispatch(setFilters({ category: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ category: category as BillType["billTypeCategory"], page: 1 }));
    }
  };

  const handleRecurringFilter = (val: string) => {
    if (val === "all") {
      dispatch(setFilters({ isRecurring: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ isRecurring: val === "true", page: 1 }));
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
        "Name",
        "Category",
        "Amount",
        "Calculation Type",
        "Recurring",
        "Status",
        "Created",
      ],
      ...(data?.items || []).map((item) => [
        item.billTypeName,
        item.billTypeCategory,
        item.defaultAmount ?? "",
        item.calculationMethod ?? "",
        item.isRecurring ? "Yes" : "No",
        item.isActive ? "Active" : "Inactive",
        new Date(item.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bill-types-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tableConfig = {
    columns: billTypeColumns,
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All", value: "all" },
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
        onChange: handleStatusFilter,
      },
      {
        id: "category",
        label: "Category",
        type: "select" as const,
        options: [
          { label: "All", value: "all" },
          { label: "Utility", value: "Utility" },
          { label: "Administrative", value: "Administrative" },
          { label: "Penalty", value: "Penalty" },
          { label: "Tax", value: "Tax" },
          { label: "Fee", value: "Fee" },
          { label: "Other", value: "Other" },
        ],
        onChange: handleCategoryFilter,
      },
      {
        id: "isRecurring",
        label: "Recurring",
        type: "select" as const,
        options: [
          { label: "All", value: "all" },
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
        onChange: handleRecurringFilter,
      },
      {
        id: "sortBy",
        label: "Sort By",
        type: "select" as const,
        options: [
          { label: "Name", value: "billTypeName" },
          { label: "Category", value: "billTypeCategory" },
          { label: "Created", value: "createdAt" },
        ],
        onChange: (value: string) =>
          handleSortChange(value, filters.sortOrder || "asc"),
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
          handleSortChange(filters.sortBy || "billTypeName", value),
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
          icon: <span>👁️</span>,
          onClick: (row: BillType) => handleView(row._id),
          variant: "outline" as const,
        },
        ...(canUpdate
          ? [
              {
                label: "Validate Configuration",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: handleValidateClick,
                variant: "outline" as const,
              },
              {
                label: "Calculate Amount",
                icon: <Calculator className="h-4 w-4" />,
                onClick: handleCalculateClick,
                variant: "outline" as const,
              },
            ]
          : []),
        ...(canDelete
          ? [
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bill Type Management</h1>
        <p className="text-muted-foreground">
          Manage bill types and calculation methods
        </p>
      </div>

      <BillTypeSummaryCards />

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
              Add Bill Type
            </Button>
          )
        }
      />

      <Card>
        <CardHeader icon={FileType}>
          <CardTitle>Bill Types</CardTitle>
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

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, billType: open ? deleteDialog.billType : null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill type
              {deleteDialog.billType ? ` (${deleteDialog.billType.billTypeName})` : ""}
              ?
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

      <Dialog
        open={validateDialog.open}
        onOpenChange={(open) =>
          setValidateDialog({
            open,
            billType: open ? validateDialog.billType : null,
            result: open ? validateDialog.result : undefined,
          })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validate Configuration</DialogTitle>
          </DialogHeader>
          {validateDialog.billType && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bill type: {validateDialog.billType.billTypeName}
              </p>
              {validateDialog.result && (
                <div className="space-y-2 text-sm">
                  <div
                    className={
                      validateDialog.result.isValid
                        ? "text-green-600 font-medium"
                        : "text-amber-600 font-medium"
                    }
                  >
                    {validateDialog.result.isValid ? "Valid" : "Issues found"}
                  </div>
                  {validateDialog.result.issues?.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1">
                      {validateDialog.result.issues.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  )}
                  {validateDialog.result.suggestions?.length > 0 && (
                    <div>
                      <span className="font-medium">Suggestions:</span>
                      <ul className="list-disc pl-4 space-y-1">
                        {validateDialog.result.suggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <Button
                onClick={handleValidateRun}
                disabled={validateMutation.isPending}
              >
                {validateMutation.isPending ? "Validating..." : "Run Validation"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={calculateDialog.open}
        onOpenChange={(open) =>
          setCalculateDialog({ open, billType: open ? calculateDialog.billType : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calculate Amount</DialogTitle>
          </DialogHeader>
          {calculateDialog.billType && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bill type: {calculateDialog.billType.billTypeName}
              </p>
              <div className="space-y-2">
                <Label>Units (for PER_UNIT)</Label>
                <Input
                  type="number"
                  min="0"
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Base Amount (for PERCENTAGE)</Label>
                <Input
                  type="number"
                  min="0"
                  value={calcBaseAmount}
                  onChange={(e) => setCalcBaseAmount(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <Button
                onClick={handleCalculateRun}
                disabled={calculateMutation.isPending}
              >
                {calculateMutation.isPending ? "Calculating..." : "Calculate"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
