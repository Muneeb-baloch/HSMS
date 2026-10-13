import { TableColumn } from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { BillType } from "@/lib/types/billType";
import { formatDate } from "@/lib/utils/format";

export const billTypeColumns: TableColumn<BillType>[] = [
  {
    id: "billTypeName",
    header: "Name",
    accessorKey: "billTypeName",
    cell: (row) => <div className="font-medium">{row.billTypeName}</div>,
    width: "160",
  },
  {
    id: "billTypeCategory",
    header: "Category",
    accessorKey: "billTypeCategory",
    cell: (row) => (
      <Badge variant="outline" className="font-medium">
        {row.billTypeCategory}
      </Badge>
    ),
    width: "120",
  },
  {
    id: "defaultAmount",
    header: "Amount",
    cell: (row) => (
      <div className="font-medium">
        {row.defaultAmount != null
          ? `Rs ${row.defaultAmount.toLocaleString()}`
          : "—"}
      </div>
    ),
    width: "110",
  },
  {
    id: "calculationMethod",
    header: "Calculation Type",
    cell: (row) => (
      <div className="text-sm">
        {row.calculationMethod || "—"}
      </div>
    ),
    width: "130",
  },
  {
    id: "isRecurring",
    header: "Is Recurring",
    cell: (row) => (
      <Badge
        className={
          row.isRecurring ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }
      >
        {row.isRecurring ? "Yes" : "No"}
      </Badge>
    ),
    width: "110",
  },
  {
    id: "isActive",
    header: "Status",
    cell: (row) => (
      <Badge
        className={
          row.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }
      >
        {row.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
    width: "100",
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
