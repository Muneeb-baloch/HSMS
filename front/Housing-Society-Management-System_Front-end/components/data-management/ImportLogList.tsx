"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
  Loader2,
  Ban,
} from "lucide-react";
import {
  useImportLogs,
  useImportLog,
  useCancelImport,
} from "@/lib/hooks/entities/useBulkOperations";
import type { ImportLogQueryParams } from "@/lib/types/bulk-operations";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  processing: "secondary",
  completed: "default",
  failed: "destructive",
  cancelled: "secondary",
};

const ENTITY_FILTER_OPTIONS = [
  { value: "all", label: "All Entities" },
  { value: "members", label: "Members" },
  { value: "plots", label: "Plots" },
  { value: "bills", label: "Bills" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ImportLogList() {
  const [params, setParams] = useState<ImportLogQueryParams>({
    page: 1,
    limit: 10,
  });
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data, isLoading } = useImportLogs(params);
  const { data: selectedLog, isLoading: logDetailLoading } = useImportLog(
    selectedLogId || ""
  );
  const cancelMutation = useCancelImport();

  const logs = data?.items || [];
  const pagination = data?.pagination;

  const handleViewDetail = (id: string) => {
    setSelectedLogId(id);
    setDetailDialogOpen(true);
  };

  const handleFilterChange = (
    key: "entityType" | "status",
    value: string
  ) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Import Logs</CardTitle>
          <CardDescription>
            View all past import operations and their results.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select
              value={params.entityType || "all"}
              onValueChange={(val) => handleFilterChange("entityType", val)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={params.status || "all"}
              onValueChange={(val) => handleFilterChange("status", val)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No import logs found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Import ID</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Success</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead className="text-right">Skipped</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-mono text-xs">
                        {log.importId.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="capitalize">
                        {log.entityType}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {log.fileName}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.totalRows}
                      </TableCell>
                      <TableCell className="text-right text-green-500">
                        {log.successCount}
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        {log.failureCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right">
                        {log.skippedCount}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[log.status] || "outline"}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(log._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(log.status === "pending" ||
                            log.status === "processing") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelMutation.mutate(log._id)}
                              disabled={cancelMutation.isPending}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
                total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setParams((prev) => ({
                      ...prev,
                      page: (prev.page || 1) - 1,
                    }))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() =>
                    setParams((prev) => ({
                      ...prev,
                      page: (prev.page || 1) + 1,
                    }))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Details</DialogTitle>
            <DialogDescription>
              {selectedLog
                ? `Import ID: ${selectedLog.importId}`
                : "Loading..."}
            </DialogDescription>
          </DialogHeader>

          {logDetailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : selectedLog ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs">Entity Type</p>
                  <p className="text-sm font-medium capitalize">
                    {selectedLog.entityType}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">File Name</p>
                  <p className="text-sm font-medium">{selectedLog.fileName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge
                    variant={STATUS_VARIANTS[selectedLog.status] || "outline"}
                  >
                    {selectedLog.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold">{selectedLog.totalRows}</p>
                  <p className="text-muted-foreground text-xs">Total</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold text-green-500">
                    {selectedLog.successCount}
                  </p>
                  <p className="text-muted-foreground text-xs">Success</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xl font-bold text-red-500">
                    {selectedLog.failureCount}
                  </p>
                  <p className="text-muted-foreground text-xs">Failed</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-muted-foreground text-xl font-bold">
                    {selectedLog.skippedCount}
                  </p>
                  <p className="text-muted-foreground text-xs">Skipped</p>
                </div>
              </div>

              {selectedLog.errors.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold">
                    Errors ({selectedLog.errors.length})
                  </h3>
                  <div className="max-h-60 overflow-y-auto rounded-md border">
                    {selectedLog.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 border-b px-3 py-2 text-sm last:border-b-0"
                      >
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                        <div>
                          <span className="font-medium">
                            Row {err.row}, {err.field}:
                          </span>{" "}
                          {err.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
