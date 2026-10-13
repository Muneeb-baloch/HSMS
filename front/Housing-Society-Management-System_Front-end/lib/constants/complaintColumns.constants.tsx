// src/lib/constants/complaintColumns.constants.tsx
import { TableColumn } from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Complaint } from "@/lib/types/complaint";
import { formatDate } from "@/lib/utils/format";

const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
  reopened: "bg-purple-100 text-purple-800",
  on_hold: "bg-slate-100 text-slate-800",
};

export const complaintColumns: TableColumn<Complaint>[] = [
  {
    id: "member",
    header: "Member",
    cell: (row) => {
      const member =
        typeof row.memId === "object" ? row.memId : null;
      return (
        <div>
          <div className="font-medium">{member?.memName || "Unknown"}</div>
          {member?.memNic && (
            <div className="text-sm text-gray-500">NIC: {member.memNic}</div>
          )}
        </div>
      );
    },
    width: "150",
  },
  {
    id: "file",
    header: "File",
    cell: (row) => {
      const file = typeof row.fileId === "object" ? row.fileId : null;
      const fileLabel = file
        ? (file as any).fileRegNo ||
          (file as any).fileBarCode ||
          (file as any).fileNo ||
          (file as any).plotNo ||
          "—"
        : "—";
      return file ? (
        <div className="font-medium">{fileLabel}</div>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
    width: "120",
  },
  {
    id: "category",
    header: "Category",
    cell: (row) => {
      const cat = typeof row.compCatId === "object" ? row.compCatId : null;
      return (
        <div className="font-medium">{cat?.categoryName || "Unknown"}</div>
      );
    },
    width: "140",
  },
  {
    id: "compTitle",
    header: "Title",
    accessorKey: "compTitle",
    cell: (row) => (
      <div className="font-medium max-w-[200px] truncate" title={row.compTitle}>
        {row.compTitle}
      </div>
    ),
    width: "180",
  },
  {
    id: "compPriority",
    header: "Priority",
    accessorKey: "compPriority",
    sortable: true,
    cell: (row) => (
      <Badge
        className={
          priorityColors[row.compPriority] || "bg-gray-100 text-gray-800"
        }
      >
        {row.compPriority}
      </Badge>
    ),
    width: "100",
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => {
      const status =
        row.status ||
        (typeof row.statusId === "object" ? row.statusId?.statusName : null);
      return (
        <Badge
          className={
            statusColors[status as string] || "bg-gray-100 text-gray-800"
          }
        >
          {status || "Unknown"}
        </Badge>
      );
    },
    width: "110",
  },
  {
    id: "assignedTo",
    header: "Assigned To",
    cell: (row) => {
      const assigned =
        typeof row.assignedTo === "object" ? row.assignedTo : null;
      return assigned ? (
        <div className="font-medium">
          {assigned.firstName} {assigned.lastName}
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
    width: "140",
  },
  {
    id: "compDate",
    header: "Date",
    accessorKey: "compDate",
    sortable: true,
    cell: (row) => <div className="font-medium">{formatDate(row.compDate)}</div>,
    width: "110",
  },
];
