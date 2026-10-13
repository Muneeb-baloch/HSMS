"use client";

import { useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2 } from "lucide-react";
import { useExportData } from "@/lib/hooks/entities/useBulkOperations";

const ENTITY_TYPES = [
  { value: "members", label: "Members" },
  { value: "plots", label: "Plots" },
  { value: "bills", label: "Bills" },
  { value: "payments", label: "Payments" },
  { value: "installments", label: "Installments" },
  { value: "visitors", label: "Visitors" },
];

const FORMAT_OPTIONS = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
] as const;

const STATUS_OPTIONS: Record<string, { value: string; label: string }[]> = {
  bills: [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
  ],
  payments: [
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
  ],
  members: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
  plots: [
    { value: "occupied", label: "Occupied" },
    { value: "vacant", label: "Vacant" },
  ],
};

export default function ExportPanel() {
  const [entityType, setEntityType] = useState("");
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");

  const exportMutation = useExportData();

  const handleExport = useCallback(() => {
    if (!entityType) return;

    const societyId =
      typeof window !== "undefined"
        ? localStorage.getItem("societyId") || ""
        : "";

    const filters: Record<string, unknown> = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (status) filters.status = status;

    exportMutation.mutate(
      {
        entityType,
        societyId,
        format,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      },
      {
        onSuccess: (data: unknown) => {
          const content =
            format === "json"
              ? JSON.stringify(data, null, 2)
              : (data as string);
          const mimeType =
            format === "json" ? "application/json" : "text/csv";
          const blob = new Blob([content], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${entityType}-export.${format}`;
          a.click();
          URL.revokeObjectURL(url);
        },
      }
    );
  }, [entityType, format, dateFrom, dateTo, status, exportMutation]);

  const statusOptions = entityType ? STATUS_OPTIONS[entityType] : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Select an entity type and optional filters to export your data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Entity Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-entity">Entity Type</Label>
            <Select value={entityType} onValueChange={(val) => {
              setEntityType(val);
              setStatus("");
            }}>
              <SelectTrigger id="export-entity">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((et) => (
                  <SelectItem key={et.value} value={et.value}>
                    {et.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-format">Format</Label>
            <Select
              value={format}
              onValueChange={(val) => setFormat(val as "csv" | "json")}
            >
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-date-from">Date From (optional)</Label>
            <Input
              id="export-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="export-date-to">Date To (optional)</Label>
            <Input
              id="export-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          {statusOptions && statusOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="export-status">Status (optional)</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="export-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          className="w-fit"
          onClick={handleExport}
          disabled={!entityType || exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </CardContent>
    </Card>
  );
}
