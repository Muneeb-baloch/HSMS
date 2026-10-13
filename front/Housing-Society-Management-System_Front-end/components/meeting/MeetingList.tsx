"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable, TableColumn } from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useMeetings,
  useDeleteMeeting,
} from "@/lib/hooks/entities/useMeeting";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/format";
import {
  Calendar,
  CalendarCheck2,
  CalendarX2,
  CheckCircle2,
  Download,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  meetingType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isOnline?: boolean;
  onlineLink?: string;
  status: string;
  quorumRequired?: number;
  quorumMet?: boolean;
  attendees?: unknown[];
  agenda?: unknown[];
  decisions?: unknown[];
  createdAt: string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  postponed: "bg-orange-100 text-orange-800",
};

const typeColors: Record<string, string> = {
  agm: "bg-purple-100 text-purple-800",
  special: "bg-red-100 text-red-800",
  committee: "bg-blue-100 text-blue-800",
  emergency: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800",
};

const meetingColumns: TableColumn<Meeting>[] = [
  {
    id: "title",
    header: "Title",
    cell: (row) => <span className="font-medium">{row.title}</span>,
    width: "200",
  },
  {
    id: "meetingType",
    header: "Type",
    cell: (row) => (
      <Badge className={typeColors[row.meetingType] || "bg-gray-100 text-gray-800"}>
        {row.meetingType?.toUpperCase() || "N/A"}
      </Badge>
    ),
    width: "110",
    hideOnMobile: true,
  },
  {
    id: "date",
    header: "Date",
    cell: (row) => (
      <span className="text-sm">{formatDate(row.date)}</span>
    ),
    width: "120",
  },
  {
    id: "time",
    header: "Time",
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.startTime || "---"}{row.endTime ? ` - ${row.endTime}` : ""}
      </span>
    ),
    width: "130",
    hideOnMobile: true,
  },
  {
    id: "location",
    header: "Location",
    cell: (row) => (
      <span className="text-sm">
        {row.isOnline ? "Online" : row.location || "---"}
      </span>
    ),
    width: "130",
    hideOnMobile: true,
    hideOnTablet: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <Badge className={statusColors[row.status] || "bg-gray-100 text-gray-800"}>
        {row.status?.replace("_", " ").charAt(0).toUpperCase() +
          row.status?.replace("_", " ").slice(1) || "N/A"}
      </Badge>
    ),
    width: "110",
  },
  {
    id: "quorum",
    header: "Quorum",
    cell: (row) => (
      <span className={`text-sm font-medium ${row.quorumMet ? "text-green-600" : "text-muted-foreground"}`}>
        {row.quorumMet != null ? (row.quorumMet ? "Met" : "Not Met") : "---"}
      </span>
    ),
    width: "80",
    hideOnMobile: true,
    hideOnTablet: true,
  },
  {
    id: "attendees",
    header: "Attendees",
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.attendees?.length ?? 0}
      </span>
    ),
    width: "80",
    hideOnMobile: true,
  },
];

export function MeetingList() {
  const { user } = useAuth();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [filters, setLocalFilters] = useState<Record<string, unknown>>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useMeetings(filters);
  const deleteMutation = useDeleteMeeting();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleCreate = () => router.push("/meetings/create");
  const handleEdit = (id: string) => router.push(`/meetings/edit/${id}`);
  const handleView = (id: string) => router.push(`/meetings/view/${id}`);
  const handleDelete = async (id: string) => {
    if (canDelete && await confirm({ title: "Delete", description: "Are you sure you want to delete this meeting?", variant: "destructive" })) {
      await deleteMutation.mutateAsync(id);
    }
  };

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

  const handleTypeFilter = (type: string) => {
    if (type === "all") {
      setLocalFilters((prev) => {
        const { type: _, ...rest } = prev as Record<string, unknown> & { type?: string };
        return { ...rest, page: 1 };
      });
    } else {
      setLocalFilters((prev) => ({ ...prev, type, page: 1 }));
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
      ["Title", "Type", "Date", "Time", "Location", "Status", "Attendees"],
      ...(data?.items || []).map((item: Meeting) => [
        item.title,
        item.meetingType || "-",
        new Date(item.date).toLocaleDateString(),
        `${item.startTime || ""} - ${item.endTime || ""}`,
        item.isOnline ? "Online" : item.location || "-",
        item.status || "-",
        item.attendees?.length ?? 0,
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meetings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Compute summary counts from items
  const items = data?.items || [];
  const totalMeetings = data?.pagination?.total ?? items.length;
  const scheduledCount = items.filter((m: Meeting) => m.status === "scheduled").length;
  const completedCount = items.filter((m: Meeting) => m.status === "completed").length;
  const cancelledCount = items.filter((m: Meeting) => m.status === "cancelled").length;

  const tableConfig = {
    columns: meetingColumns,
    filters: [
      {
        id: "type",
        label: "Type",
        type: "select" as const,
        options: [
          { label: "All Types", value: "all" },
          { label: "AGM", value: "agm" },
          { label: "Special", value: "special" },
          { label: "Committee", value: "committee" },
          { label: "Emergency", value: "emergency" },
          { label: "General", value: "general" },
        ],
        onChange: handleTypeFilter,
      },
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "all" },
          { label: "Scheduled", value: "scheduled" },
          { label: "In Progress", value: "in_progress" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
          { label: "Postponed", value: "postponed" },
        ],
        onChange: handleStatusFilter,
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
          onClick: (row: Meeting) => handleView(row._id),
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
        <h1 className="text-2xl font-bold">Meetings</h1>
        <p className="text-muted-foreground">
          Schedule and manage society meetings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Meetings"
          value={totalMeetings}
          icon={Calendar}
          iconBgClassName="bg-blue-100"
          iconClassName="text-blue-600"
          gradient="from-blue-500/10 to-transparent"
        />
        <SummaryCard
          title="Scheduled"
          value={scheduledCount}
          icon={CalendarCheck2}
          iconBgClassName="bg-yellow-100"
          iconClassName="text-yellow-600"
          valueClassName="text-yellow-600"
          gradient="from-yellow-500/10 to-transparent"
        />
        <SummaryCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
          iconBgClassName="bg-green-100"
          iconClassName="text-green-600"
          valueClassName="text-green-600"
          gradient="from-green-500/10 to-transparent"
        />
        <SummaryCard
          title="Cancelled"
          value={cancelledCount}
          icon={CalendarX2}
          iconBgClassName="bg-red-100"
          iconClassName="text-red-600"
          valueClassName="text-red-600"
          gradient="from-red-500/10 to-transparent"
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
        right={
          canCreate && (
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus className="size-4" />
              Add Meeting
            </Button>
          )
        }
      />

      <Card>
        <CardHeader icon={Calendar}>
          <CardTitle>Meetings</CardTitle>
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
