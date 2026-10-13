import { TableColumn } from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { BillInfo } from "@/lib/types/billInfo";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  "Partially Paid": "bg-blue-100 text-blue-800",
  Overdue: "bg-red-100 text-red-800",
  Cancelled: "bg-gray-100 text-gray-800",
  Disputed: "bg-orange-100 text-orange-800",
};

export const billInfoColumns: TableColumn<BillInfo>[] = [
  {
    id: "billNo",
    header: "Bill No",
    accessorKey: "billNo",
    cell: (row) => (
      <div className="font-medium">{row.billNo}</div>
    ),
    width: "120",
  },
  {
    id: "member",
    header: "Member",
    cell: (row) => {
      const member = typeof row.memId === "object" ? row.memId : null;
      const name = member?.memName || member?.fullName || "—";
      return <div className="font-medium">{name}</div>;
    },
    width: "150",
  },
  {
    id: "file",
    header: "File",
    cell: (row) => {
      const file = typeof row.fileId === "object" ? row.fileId : null;
      const label = file?.fileRegNo || file?.fileNo || "—";
      return <div className="font-medium">{label}</div>;
    },
    width: "120",
  },
  {
    id: "billType",
    header: "Bill Type",
    cell: (row) => {
      const bt = row.billType ?? (typeof row.billTypeId === "object" ? row.billTypeId : null);
      const label = bt?.billTypeName ?? "—";
      return <div className="font-medium">{label}</div>;
    },
    width: "140",
  },
  {
    id: "billAmount",
    header: "Amount",
    accessorKey: "billAmount",
    cell: (row) => (
      <div className="font-medium">{formatCurrency(row.billAmount || row.totalPayable || 0)}</div>
    ),
    width: "110",
  },
  {
    id: "paidAmount",
    header: "Paid Amount",
    cell: (row) => (
      <div className="font-medium">
        {formatCurrency(row.totalPaid ?? (row.status === "Paid" ? row.totalPayable : 0))}
      </div>
    ),
    width: "110",
  },
  {
    id: "remainingAmount",
    header: "Remaining Amount",
    cell: (row) => (
      <div className="font-medium text-amber-600">
        {formatCurrency(row.remainingBalance ?? (row.totalPayable || 0) - (row.totalPaid || 0))}
      </div>
    ),
    width: "130",
  },
  {
    id: "dueDate",
    header: "Due Date",
    accessorKey: "dueDate",
    sortable: true,
    cell: (row) => <div className="font-medium">{formatDate(row.dueDate)}</div>,
    width: "110",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (row) => (
      <Badge className={statusColors[row.status] || "bg-gray-100 text-gray-800"}>
        {row.status}
      </Badge>
    ),
    width: "120",
  },
  {
    id: "createdAt",
    header: "Created Date",
    accessorKey: "createdAt",
    sortable: true,
    cell: (row) => <div className="font-medium">{formatDate(row.createdAt)}</div>,
    width: "120",
  },
];
