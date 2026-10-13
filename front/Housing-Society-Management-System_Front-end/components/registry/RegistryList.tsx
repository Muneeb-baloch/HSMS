"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registryColumns } from "@/lib/constants/registryColumns.constants";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useRegistries,
  useDeleteRegistry,
  useVerifyRegistry,
} from "@/lib/hooks/entities/useRegistry";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetFilters, setFilters } from "@/lib/store/slices/registrySlice";
import { SummaryCard } from "@/components/shared/SummaryCard";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Registry } from "@/lib/types/registry";
import { useConfirm } from "@/components/shared/ConfirmDialog";

export function RegistryList() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const filters = useAppSelector((state) => state.registries?.filters || {});
  const [searchValue, setSearchValue] = useState("");
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useRegistries(filters);
  const deleteMutation = useDeleteRegistry();
  const verifyMutation = useVerifyRegistry();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleCreate = () => router.push("/registry/create");
  const handleEdit = (id: string) => router.push(`/registry/edit/${id}`);
  const handleView = (id: string) => router.push(`/registry/view/${id}`);
  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: "Are you sure you want to delete this registry?", variant: "destructive" })) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleVerify = async (row: Registry) => {
    if (row.verificationStatus !== "Pending" || !canUpdate) return;
    if (await confirm({ title: "Verify", description: "Verify this registry document?" })) {
      await verifyMutation.mutateAsync({
        id: row._id,
        data: { verificationStatus: "Verified" },
      });
    }
  };

  const handleReject = async (row: Registry) => {
    if (row.verificationStatus !== "Pending" || !canUpdate) return;
    const remarks = prompt("Enter rejection remarks (optional):");
    await verifyMutation.mutateAsync({
      id: row._id,
      data: {
        verificationStatus: "Rejected",
        verificationRemarks: remarks || undefined,
      },
    });
  };

  const handleSearch = (search: string) => {
    setSearchValue(search);
    dispatch(setFilters({ search, page: 1 }));
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }));
  };

  const handleVerificationFilter = (verificationStatus: string) => {
    if (verificationStatus === "all") {
      dispatch(setFilters({ verificationStatus: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ verificationStatus: verificationStatus as any, page: 1 }));
    }
  };

  const handleMemberFilter = (memId: string) => {
    if (memId === "all") {
      dispatch(setFilters({ memId: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ memId, page: 1 }));
    }
  };

  const handlePlotFilter = (plotId: string) => {
    if (plotId === "all") {
      dispatch(setFilters({ plotId: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ plotId, page: 1 }));
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
        "Registry No",
        "Member",
        "Plot",
        "Mutation No",
        "Area",
        "Verification",
        "Registered By",
        "Date",
      ],
      ...(data?.items || []).map((item) => [
        item.registryNo,
        typeof item.memId === "object" ? item.memId?.memName : "—",
        typeof item.plotId === "object"
          ? (item.plotId as any)?.plotBlockId && typeof (item.plotId as any).plotBlockId === "object"
            ? `${(item.plotId as any).plotBlockId.plotBlockName} - ${(item.plotId as any).plotNo}`
            : (item.plotId as any)?.plotNo
          : "—",
        item.mutationNo,
        item.totalArea ||
          (item.areaKanal || item.areaMarla
            ? `${item.areaKanal || 0}-${item.areaMarla || 0}`
            : item.areaSqft || "—"),
        item.verificationStatus,
        typeof item.registeredBy === "object"
          ? item.registeredBy?.fullName || item.registeredBy?.userName
          : "—",
        new Date(item.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tableConfig = {
    columns: registryColumns,
    filters: [
      {
        id: "verificationStatus",
        label: "Verification Status",
        type: "select" as const,
        options: [
          { label: "All", value: "all" },
          { label: "Pending", value: "Pending" },
          { label: "Verified", value: "Verified" },
          { label: "Rejected", value: "Rejected" },
        ],
        onChange: handleVerificationFilter,
      },
      {
        id: "sortBy",
        label: "Sort By",
        type: "select" as const,
        options: [
          { label: "Date", value: "createdAt" },
          { label: "Registry No", value: "registryNo" },
          { label: "Mutation No", value: "mutationNo" },
          { label: "Verification", value: "verificationStatus" },
          { label: "Area", value: "areaKanal" },
        ],
        onChange: (value: string) =>
          handleSortChange(value, filters.sortOrder || "desc"),
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
          handleSortChange(filters.sortBy || "createdAt", value),
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
          onClick: (row: Registry) => handleView(row._id),
          variant: "outline" as const,
        },
        ...(canUpdate
          ? [
              {
                label: "Verify",
                icon: <span>✓</span>,
                onClick: (row: Registry) => handleVerify(row),
                variant: "outline" as const,
              },
              {
                label: "Reject",
                icon: <span>✕</span>,
                onClick: (row: Registry) => handleReject(row),
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
        <h1 className="text-2xl font-bold">Registry</h1>
        <p className="text-muted-foreground">
          Manage land registry documents
        </p>
      </div>

      {/* Summary Cards */}
        {data?.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Registries"
              value={data.summary.totalRegistries ?? 0}
              icon={FileText}
              iconBgClassName="bg-blue-100"
              iconClassName="text-blue-600"
            />
            <SummaryCard
              title="Pending"
              value={data.summary.pendingVerifications ?? 0}
              icon={AlertCircle}
              iconBgClassName="bg-yellow-100"
              iconClassName="text-yellow-600"
              valueClassName="text-yellow-600"
            />
            <SummaryCard
              title="Approved"
              value={data.summary.verifiedRegistries ?? 0}
              icon={CheckCircle2}
              iconBgClassName="bg-green-100"
              iconClassName="text-green-600"
              valueClassName="text-green-600"
            />
            <SummaryCard
              title="Rejected"
              value={data.summary.rejectedRegistries ?? 0}
              icon={XCircle}
              iconBgClassName="bg-red-100"
              iconClassName="text-red-600"
              valueClassName="text-red-600"
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
                Add Registry
              </Button>
            )
          }
        />

      <Card>
        <CardHeader icon={FileText}>
          <CardTitle>Registries</CardTitle>
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
