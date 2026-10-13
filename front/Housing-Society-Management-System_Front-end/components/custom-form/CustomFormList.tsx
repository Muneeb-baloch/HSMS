"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable } from "@/components/shared/DataTable/DataTable";
import { TableColumn } from "@/components/shared/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useCustomForms,
  useDeleteCustomForm,
} from "@/lib/hooks/entities/useCustomForm";
import { CustomFormField } from "@/lib/types/custom-form";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  resetFilters,
  setFilters,
} from "@/lib/store/slices/customFormSlice";
import { SummaryCard } from "@/components/shared/SummaryCard/SummaryCard";
import {
  CheckCircle2,
  Download,
  FileText,
  Layers,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const fieldTypeColors: Record<string, string> = {
  text: "bg-blue-100 text-blue-800",
  number: "bg-purple-100 text-purple-800",
  date: "bg-yellow-100 text-yellow-800",
  select: "bg-green-100 text-green-800",
  multiselect: "bg-teal-100 text-teal-800",
  file: "bg-orange-100 text-orange-800",
  boolean: "bg-indigo-100 text-indigo-800",
  textarea: "bg-cyan-100 text-cyan-800",
  email: "bg-pink-100 text-pink-800",
  phone: "bg-rose-100 text-rose-800",
  url: "bg-violet-100 text-violet-800",
};

const customFormColumns: TableColumn<CustomFormField>[] = [
  {
    id: "fieldLabel",
    header: "Field Label",
    accessorKey: "fieldLabel",
    cell: (row) => (
      <div className="font-medium max-w-[180px] truncate" title={row.fieldLabel}>
        {row.fieldLabel}
      </div>
    ),
    width: "180",
  },
  {
    id: "fieldName",
    header: "Field Name",
    accessorKey: "fieldName",
    cell: (row) => (
      <div
        className="font-mono text-sm max-w-[150px] truncate"
        title={row.fieldName}
      >
        {row.fieldName}
      </div>
    ),
    width: "150",
  },
  {
    id: "entityType",
    header: "Entity Type",
    accessorKey: "entityType",
    cell: (row) => (
      <div className="font-medium capitalize">{row.entityType}</div>
    ),
    width: "120",
  },
  {
    id: "fieldType",
    header: "Field Type",
    accessorKey: "fieldType",
    cell: (row) => (
      <Badge
        className={fieldTypeColors[row.fieldType] || "bg-gray-100 text-gray-800"}
      >
        {row.fieldType}
      </Badge>
    ),
    width: "110",
  },
  {
    id: "isRequired",
    header: "Required",
    cell: (row) => (
      <Badge
        className={
          row.isRequired
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-800"
        }
      >
        {row.isRequired ? "Yes" : "No"}
      </Badge>
    ),
    width: "90",
  },
  {
    id: "section",
    header: "Section",
    accessorKey: "section",
    cell: (row) => (
      <div className="font-medium">{row.section || "—"}</div>
    ),
    width: "120",
  },
  {
    id: "order",
    header: "Order",
    accessorKey: "order",
    sortable: true,
    cell: (row) => <div className="font-medium">{row.order}</div>,
    width: "70",
  },
  {
    id: "isActive",
    header: "Active",
    cell: (row) => (
      <Badge
        className={
          row.isActive
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }
      >
        {row.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
    width: "90",
  },
];

export function CustomFormList() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const filters = useAppSelector((state) => state.customForms?.filters || {});
  const [searchValue, setSearchValue] = useState("");
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useCustomForms(filters);
  const deleteMutation = useDeleteCustomForm();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleCreate = () => router.push("/custom-forms/create");
  const handleEdit = (id: string) => router.push(`/custom-forms/edit/${id}`);
  const handleView = (id: string) => router.push(`/custom-forms/view/${id}`);
  const handleDelete = async (id: string) => {
    if (
      canDelete &&
      await confirm({ title: "Delete", description: "Are you sure you want to delete this custom form field?", variant: "destructive" })
    ) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSearch = (search: string) => {
    setSearchValue(search);
    dispatch(setFilters({ search, page: 1 }));
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }));
  };

  const handleEntityTypeFilter = (entityType: string) => {
    if (entityType === "all") {
      dispatch(setFilters({ entityType: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ entityType, page: 1 }));
    }
  };

  const handleFieldTypeFilter = (fieldType: string) => {
    if (fieldType === "all") {
      dispatch(setFilters({ fieldType: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ fieldType, page: 1 }));
    }
  };

  const handleActiveFilter = (isActive: string) => {
    if (isActive === "all") {
      dispatch(setFilters({ isActive: undefined, page: 1 }));
    } else {
      dispatch(setFilters({ isActive: isActive === "true", page: 1 }));
    }
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
        "Field Label",
        "Field Name",
        "Entity Type",
        "Field Type",
        "Required",
        "Section",
        "Order",
        "Active",
      ],
      ...(data?.items || []).map((item) => [
        item.fieldLabel,
        item.fieldName,
        item.entityType,
        item.fieldType,
        item.isRequired ? "Yes" : "No",
        item.section || "",
        String(item.order),
        item.isActive ? "Active" : "Inactive",
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `custom-forms-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const items = data?.items || [];
  const totalFields = items.length;
  const activeFields = items.filter((f) => f.isActive).length;
  const uniqueEntityTypes = new Set(items.map((f) => f.entityType)).size;

  const tableConfig = {
    columns: customFormColumns,
    filters: [
      {
        id: "entityType",
        label: "Entity Type",
        type: "select" as const,
        options: [
          { label: "All Entities", value: "all" },
          { label: "Member", value: "member" },
          { label: "Plot", value: "plot" },
          { label: "Complaint", value: "complaint" },
          { label: "Application", value: "application" },
          { label: "Visitor", value: "visitor" },
          { label: "Facility", value: "facility" },
        ],
        onChange: handleEntityTypeFilter,
      },
      {
        id: "fieldType",
        label: "Field Type",
        type: "select" as const,
        options: [
          { label: "All Types", value: "all" },
          { label: "Text", value: "text" },
          { label: "Number", value: "number" },
          { label: "Date", value: "date" },
          { label: "Select", value: "select" },
          { label: "Multi Select", value: "multiselect" },
          { label: "File", value: "file" },
          { label: "Boolean", value: "boolean" },
          { label: "Textarea", value: "textarea" },
          { label: "Email", value: "email" },
          { label: "Phone", value: "phone" },
          { label: "URL", value: "url" },
        ],
        onChange: handleFieldTypeFilter,
      },
      {
        id: "isActive",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "all" },
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
        onChange: handleActiveFilter,
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
          onClick: (row: CustomFormField) => handleView(row._id),
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
            dispatch(setFilters({ limit: size, page: 1 })),
          totalItems: data.pagination.total,
        }
      : undefined,
    responsive: { showMobileView: true, stickyHeader: true },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Custom Form Fields</h1>
        <p className="text-muted-foreground">
          Manage custom fields for entity forms
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Fields"
          value={totalFields}
          icon={FileText}
          iconBgClassName="bg-blue-100"
          iconClassName="text-blue-600"
        />
        <SummaryCard
          title="Active Fields"
          value={activeFields}
          icon={CheckCircle2}
          iconBgClassName="bg-green-100"
          iconClassName="text-green-600"
          valueClassName="text-green-600"
        />
        <SummaryCard
          title="Entity Types"
          value={uniqueEntityTypes}
          icon={Layers}
          iconBgClassName="bg-purple-100"
          iconClassName="text-purple-600"
          valueClassName="text-purple-600"
        />
      </div>

      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 3 && (
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
              Add Custom Field
            </Button>
          )
        }
      />

      <Card>
        <CardHeader icon={FileText}>
          <CardTitle>Custom Form Fields</CardTitle>
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
