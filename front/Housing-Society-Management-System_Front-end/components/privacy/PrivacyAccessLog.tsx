"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePrivacyAccessLog } from "@/lib/hooks/entities/usePrivacy";
import { PrivacyAccessLog as PrivacyAccessLogType } from "@/lib/types/privacy";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
} from "lucide-react";

export function PrivacyAccessLog() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError } = usePrivacyAccessLog({ page, limit });

  const logs = data?.items || [];
  const pagination = data?.pagination;

  const filteredLogs = logs.filter((log: PrivacyAccessLogType) => {
    if (dateFrom && new Date(log.timestamp) < new Date(dateFrom)) return false;
    if (dateTo && new Date(log.timestamp) > new Date(dateTo + "T23:59:59"))
      return false;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAccessTypeBadge = (accessType: string) => {
    switch (accessType.toLowerCase()) {
      case "read":
        return <Badge variant="secondary">{accessType}</Badge>;
      case "write":
      case "update":
        return <Badge variant="warning">{accessType}</Badge>;
      case "delete":
        return <Badge variant="destructive">{accessType}</Badge>;
      default:
        return <Badge variant="outline">{accessType}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">
          Failed to load access logs. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Who accessed your data
          </h2>
          <p className="text-sm text-muted-foreground">
            View a log of all access to your personal information
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-end gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Date From
                </Label>
                <Input
                  type="date"
                  className="w-[160px]"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Date To
                </Label>
                <Input
                  type="date"
                  className="w-[160px]"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Access Log</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No access logs found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accessor</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access Type</TableHead>
                  <TableHead>Fields Accessed</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: PrivacyAccessLogType) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium">
                      {log.accessorId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.accessorRole}</Badge>
                    </TableCell>
                    <TableCell>{getAccessTypeBadge(log.accessType)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {log.fieldsAccessed.map((field, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(log.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
                total entries)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
