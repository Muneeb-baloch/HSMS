"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useAlertHistory } from "@/lib/hooks/entities/useEmergency";
import {
  ArrowLeft,
  History,
  Loader2,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AlertHistory() {
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, unknown>>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = useAlertHistory(filters);
  const items = data?.items || [];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleTypeFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      type: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleSeverityFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      severity: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600 text-white">Critical</Badge>;
      case "high":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Resolved
          </Badge>
        );
      case "false_alarm":
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
            False Alarm
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Active
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/emergency")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Alert History</h1>
          <p className="text-muted-foreground">
            View past emergency alerts and their outcomes
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 w-[200px]"
          />
        </div>
        <Select onValueChange={handleTypeFilter}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fire">Fire</SelectItem>
            <SelectItem value="medical">Medical</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
            <SelectItem value="gas_leak">Gas Leak</SelectItem>
            <SelectItem value="flood">Flood</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleSeverityFilter}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            Past Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No alert history found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Triggered At</TableHead>
                    <TableHead>Resolved At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((alert: Record<string, unknown>) => (
                    <TableRow key={alert._id as string}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {alert.title as string}
                      </TableCell>
                      <TableCell className="capitalize">
                        {(alert.type as string)?.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(alert.severity as string)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(alert.status as string)}
                      </TableCell>
                      <TableCell>
                        {alert.createdAt
                          ? new Date(
                              alert.createdAt as string
                            ).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {alert.resolvedAt
                          ? new Date(
                              alert.resolvedAt as string
                            ).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.pagination.page <= 1}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page as number) - 1,
                    }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.pagination.page >= data.pagination.pages}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page as number) + 1,
                    }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
