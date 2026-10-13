"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable, TableColumn } from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useDomesticStaff,
  useDeleteStaff,
  useSearchByCNIC,
} from "@/lib/hooks/entities/useStaffRegistry";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const getStaffTypeVariant = (
  type: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (type) {
    case "guard":
    case "security":
      return "destructive";
    case "maid":
    case "cook":
      return "success";
    case "driver":
      return "warning";
    default:
      return "secondary";
  }
};

const renderStars = (rating: number) => {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i <= rounded
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const staffColumns: TableColumn<any>[] = [
  {
    id: "fullName",
    header: "Name",
    accessorKey: "fullName",
    sortable: true,
    cell: (row) => <span className="font-medium">{row.fullName}</span>,
  },
  {
    id: "cnic",
    header: "CNIC",
    accessorKey: "cnic",
    cell: (row) => (
      <span className="font-mono text-sm">{row.cnic || "N/A"}</span>
    ),
  },
  {
    id: "phone",
    header: "Phone",
    accessorKey: "phone",
    cell: (row) => row.phone || "N/A",
  },
  {
    id: "staffType",
    header: "Type",
    accessorKey: "staffType",
    cell: (row) => (
      <Badge variant={getStaffTypeVariant(row.staffType)}>
        {row.staffType?.replace(/_/g, " ").toUpperCase() || "N/A"}
      </Badge>
    ),
  },
  {
    id: "isVerified",
    header: "Verified",
    cell: (row) =>
      row.isVerified ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-gray-400" />
      ),
  },
  {
    id: "averageRating",
    header: "Avg Rating",
    cell: (row) =>
      row.averageRating ? (
        <div className="flex items-center gap-1">
          {renderStars(row.averageRating)}
          <span className="text-sm text-muted-foreground ml-1">
            ({Number(row.averageRating).toFixed(1)})
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">No ratings</span>
      ),
  },
  {
    id: "totalRatings",
    header: "Total Ratings",
    cell: (row) => row.totalRatings ?? row.ratings?.length ?? 0,
  },
  {
    id: "blacklisted",
    header: "Blacklisted",
    cell: (row) =>
      row.isBlacklisted ? (
        <Badge variant="destructive">Blacklisted</Badge>
      ) : null,
  },
];

export function StaffList() {
  const { user } = useAuth();
  const router = useRouter();
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({});
  const { confirm } = useConfirm();
  const [page, setPage] = useState(1);
  const [cnicSearch, setCnicSearch] = useState("");

  const { data, isLoading, refetch } = useDomesticStaff({ ...filters, page });
  const { data: cnicResult, isLoading: cnicLoading } = useSearchByCNIC(cnicSearch);
  const deleteMutation = useDeleteStaff();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
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

  const handleCreate = () => router.push("/staff-registry/create");
  const handleView = (id: string) => router.push(`/staff-registry/view/${id}`);
  const handleEdit = (id: string) => router.push(`/staff-registry/edit/${id}`);

  const handleDelete = async (id: string) => {
    if (canManage && await confirm({ title: "Delete", description: "Are you sure you want to delete this staff record?", variant: "destructive" })) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        customToast.error("Failed to delete staff record");
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

  // Summary counts
  const items = data?.items || [];
  const totalCount = data?.pagination?.total || items.length;
  const verifiedCount = items.filter((s: any) => s.isVerified).length;
  const blacklistedCount = items.filter((s: any) => s.isBlacklisted).length;

  const tableConfig = {
    columns: staffColumns,
    filters: [
      {
        id: "type",
        label: "Staff Type",
        type: "select" as const,
        options: [
          { label: "All Types", value: "" },
          { label: "Maid", value: "maid" },
          { label: "Driver", value: "driver" },
          { label: "Cook", value: "cook" },
          { label: "Gardener", value: "gardener" },
          { label: "Guard", value: "guard" },
          { label: "Sweeper", value: "sweeper" },
          { label: "Nanny", value: "nanny" },
          { label: "Tutor", value: "tutor" },
          { label: "Other", value: "other" },
        ],
      },
      {
        id: "verificationStatus",
        label: "Verified",
        type: "select" as const,
        options: [
          { label: "All", value: "" },
          { label: "Verified", value: "verified" },
          { label: "Unverified", value: "unverified" },
        ],
      },
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All", value: "" },
          { label: "Active", value: "active" },
          { label: "Blacklisted", value: "blacklisted" },
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
        <h1 className="text-2xl font-bold">Staff Registry</h1>
        <p className="text-muted-foreground">
          Manage and verify domestic staff records
        </p>
      </div>

      {/* CNIC Search */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by CNIC (13 digits)..."
              value={cnicSearch}
              onChange={(e) => setCnicSearch(e.target.value.replace(/\D/g, "").slice(0, 13))}
              className="max-w-sm font-mono"
            />
            {cnicLoading && (
              <span className="text-sm text-muted-foreground">Searching...</span>
            )}
            {cnicSearch.length >= 13 && cnicResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(cnicResult._id)}
              >
                View: {cnicResult.fullName}
              </Button>
            )}
            {cnicSearch.length >= 13 && !cnicLoading && !cnicResult && (
              <span className="text-sm text-muted-foreground">
                No staff found with this CNIC
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {verifiedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Blacklisted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {blacklistedCount}
            </div>
          </CardContent>
        </Card>
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
              Register Staff
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Staff</CardTitle>
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
