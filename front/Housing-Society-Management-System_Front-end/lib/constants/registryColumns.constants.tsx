// src/lib/constants/registryColumns.constants.tsx
import { TableColumn } from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Registry } from "@/lib/types/registry";
import { formatDate } from "@/lib/utils/format";

const verificationColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Verified: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

export const registryColumns: TableColumn<Registry>[] = [
  {
    id: "registryNo",
    header: "Registry No",
    accessorKey: "registryNo",
    sortable: true,
    cell: (row) => (
      <div className="font-medium font-mono">{row.registryNo}</div>
    ),
    width: "120",
  },
  {
    id: "member",
    header: "Member",
    cell: (row) => {
      const member = typeof row.memId === "object" ? row.memId : null;
      return (
        <div>
          <div className="font-medium">{member?.memName || "—"}</div>
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
      const project =
        plot?.projectId && typeof plot.projectId === "object"
          ? plot.projectId.projName
          : null;
      return (
        <div>
          <div className="font-medium">{plot?.plotNo || "—"}</div>
          {block && (
            <div className="text-sm text-gray-500">Block: {block}</div>
          )}
          {project && !block && (
            <div className="text-sm text-gray-500">{project}</div>
          )}
        </div>
      );
    },
    width: "120",
  },
  {
    id: "mutationNo",
    header: "Mutation No",
    accessorKey: "mutationNo",
    cell: (row) => (
      <div className="font-mono text-sm">{row.mutationNo}</div>
    ),
    width: "120",
  },
  {
    id: "area",
    header: "Area",
    cell: (row) => (
      <div className="text-sm">
        {row.totalArea ||
          (row.areaKanal || row.areaMarla
            ? `${row.areaKanal || 0}-${row.areaMarla || 0}`
            : row.areaSqft
            ? `${row.areaSqft} sq.ft`
            : "—")}
      </div>
    ),
    width: "100",
  },
  {
    id: "verificationStatus",
    header: "Verification",
    accessorKey: "verificationStatus",
    cell: (row) => (
      <Badge
        className={
          verificationColors[row.verificationStatus] || "bg-gray-100 text-gray-800"
        }
      >
        {row.verificationStatus}
      </Badge>
    ),
    width: "110",
  },
  {
    id: "registeredBy",
    header: "Registered By",
    cell: (row) => {
      const user = typeof row.registeredBy === "object" ? row.registeredBy : null;
      return (
        <div className="text-sm">
          {user?.fullName || user?.userName || "—"}
        </div>
      );
    },
    width: "130",
  },
  {
    id: "createdAt",
    header: "Date",
    accessorKey: "createdAt",
    sortable: true,
    cell: (row) => (
      <div className="text-sm">{formatDate(row.createdAt)}</div>
    ),
    width: "110",
  },
];
