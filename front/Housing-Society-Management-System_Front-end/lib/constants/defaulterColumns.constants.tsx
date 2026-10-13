import { TableColumn } from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Defaulter } from "@/lib/types/defaulter";
import { formatDate } from "@/lib/utils/format";
import { formatCurrency } from "@/lib/utils/format";

const statusColors: Record<string, string> = {
  Warning: "bg-yellow-100 text-yellow-800",
  Suspended: "bg-orange-100 text-orange-800",
  "Legal Action": "bg-red-100 text-red-800",
  Resolved: "bg-green-100 text-green-800",
};

export const defaulterColumns: TableColumn<Defaulter>[] = [
  {
    id: "member",
    header: "Member",
    cell: (row) => {
      const member =
        typeof row.memId === "object" ? row.memId : null;
      const name = member?.memName || member?.fullName || "—";
      return (
        <div>
          <div className="font-medium">{name}</div>
          {member?.memNic && (
            <div className="text-sm text-gray-500">{member.memNic}</div>
          )}
        </div>
      );
    },
    width: "150",
  },
  {
    id: "plot",
    header: "Plot",
    cell: (row) => {
      const plot = typeof row.plotId === "object" ? row.plotId : null;
      const block =
        plot?.plotBlockId && typeof plot.plotBlockId === "object"
          ? plot.plotBlockId.plotBlockName
          : null;
      return (
        <div>
          <div className="font-medium">{plot?.plotNo || "—"}</div>
          {block && (
            <div className="text-sm text-gray-500">{block}</div>
          )}
        </div>
      );
    },
    width: "100",
  },
  {
    id: "totalOverdueAmount",
    header: "Amount",
    accessorKey: "totalOverdueAmount",
    cell: (row) => (
      <div className="font-medium">
        {formatCurrency(row.totalOverdueAmount)}
      </div>
    ),
    width: "120",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (row) => (
      <Badge
        className={
          statusColors[row.status] || "bg-gray-100 text-gray-800"
        }
      >
        {row.status}
      </Badge>
    ),
    width: "110",
  },
  {
    id: "daysOverdue",
    header: "Overdue Days",
    accessorKey: "daysOverdue",
    cell: (row) => (
      <div className="font-medium">{row.daysOverdue}</div>
    ),
    width: "100",
  },
  {
    id: "noticeSentCount",
    header: "Notice Sent",
    accessorKey: "noticeSentCount",
    cell: (row) => (
      <div className="text-sm">{row.noticeSentCount}</div>
    ),
    width: "90",
  },
  {
    id: "createdBy",
    header: "Assigned To",
    cell: (row) => {
      const user =
        typeof row.createdBy === "object" ? row.createdBy : null;
      return (
        <div className="text-sm">
          {user?.fullName || user?.userName || "—"}
        </div>
      );
    },
    width: "120",
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorKey: "createdAt",
    sortable: true,
    cell: (row) => (
      <div className="text-sm">{formatDate(row.createdAt)}</div>
    ),
    width: "110",
  },
];
