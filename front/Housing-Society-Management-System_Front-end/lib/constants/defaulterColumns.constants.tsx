import { TableColumn } from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { DefaulterRow } from "@/lib/types/defaulter";
import { formatDate } from "@/lib/utils/format";
import { formatCurrency } from "@/lib/utils/format";

const statusColors: Record<string, string> = {
  Warning: "bg-yellow-100 text-yellow-800",
  Suspended: "bg-orange-100 text-orange-800",
  "Legal Action": "bg-red-100 text-red-800",
  Resolved: "bg-green-100 text-green-800",
};

export const defaulterColumns: TableColumn<DefaulterRow>[] = [
  {
    id: "member",
    header: "Member",
    cell: (row) => {
      const name = row.member?.memName || row.member?.fullName || "—";
      return (
        <div>
          <div className="font-medium">{name}</div>
          {row.member?.memNic && (
            <div className="text-sm text-gray-500">{row.member.memNic}</div>
          )}
        </div>
      );
    },
    width: "150",
  },
  {
    id: "plot",
    header: "Plot",
    cell: (row) => (
      <div>
        <div className="font-medium">{row.plot?.plotNo || "—"}</div>
        {row.plot?.plotBlockId?.plotBlockName && (
          <div className="text-sm text-gray-500">{row.plot.plotBlockId.plotBlockName}</div>
        )}
      </div>
    ),
    width: "100",
  },
  {
    id: "fileRegNo",
    header: "File",
    cell: (row) => <div className="text-sm">{row.file?.fileRegNo || "—"}</div>,
    width: "120",
  },
  {
    id: "installmentsOverdue",
    header: "Installments Overdue",
    accessorKey: "installmentsOverdue",
    cell: (row) => <div>{formatCurrency(row.installmentsOverdue)}</div>,
    width: "130",
  },
  {
    id: "billsOverdue",
    header: "Bills Overdue",
    accessorKey: "billsOverdue",
    cell: (row) => <div>{formatCurrency(row.billsOverdue)}</div>,
    width: "120",
  },
  {
    id: "totalOverdue",
    header: "Total Overdue",
    accessorKey: "totalOverdue",
    sortable: true,
    cell: (row) => <div className="font-medium">{formatCurrency(row.totalOverdue)}</div>,
    width: "130",
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <div className="flex flex-col gap-1">
        <Badge className={statusColors[row.actualStatus] || "bg-gray-100 text-gray-800"}>
          {row.actualStatus}
        </Badge>
        {row.statusOverride && row.statusOverride !== row.suggestedStatus && (
          <span className="text-xs text-gray-500">suggested: {row.suggestedStatus}</span>
        )}
      </div>
    ),
    width: "140",
  },
  {
    id: "daysOverdue",
    header: "Days Overdue",
    accessorKey: "daysOverdue",
    sortable: true,
    cell: (row) => <div className="font-medium">{row.daysOverdue}</div>,
    width: "100",
  },
  {
    id: "noticeSentCount",
    header: "Notices Sent",
    accessorKey: "noticeSentCount",
    cell: (row) => <div className="text-sm">{row.noticeSentCount}</div>,
    width: "90",
  },
  {
    id: "oldestUnpaidDueDate",
    header: "Overdue Since",
    cell: (row) => <div className="text-sm">{formatDate(row.oldestUnpaidDueDate)}</div>,
    width: "110",
  },
];
