"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useParkingPasses,
  useCancelPass,
} from "@/lib/hooks/entities/useParking";
import {
  KeySquare,
  Loader2,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const PURPOSE_COLORS: Record<string, string> = {
  resident: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  visitor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  temporary: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  contractor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  delivery: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  verified: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

export function PassList() {
  const [search, setSearch] = useState("");
  const { confirm } = useConfirm();
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page, limit: 20 };
  if (search) params.search = search;
  if (statusFilter && statusFilter !== "all") params.status = statusFilter;

  const { data, isLoading } = useParkingPasses(params);
  const cancelMutation = useCancelPass();

  let items = Array.isArray(data?.items) ? data.items : [];

  // Client-side filter for purpose since API may not support it directly
  if (purposeFilter && purposeFilter !== "all") {
    items = items.filter(
      (p: Record<string, unknown>) => (p.purpose as string) === purposeFilter
    );
  }

  const handleVerify = (code: string) => {
    window.open(`/parking/passes?verify=${code}`, "_self");
  };

  const handleCancel = async (id: string) => {
    if (await confirm({ title: "Cancel", description: "Are you sure you want to cancel this pass?" })) {
      cancelMutation.mutate(id);
    }
  };

  const formatDate = (dateStr: unknown) => {
    if (!dateStr) return "-";
    return new Date(dateStr as string).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parking Passes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage parking passes
        </p>
      </div>

      <ActionBar
        left={
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search passes..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 w-64"
              />
            </div>
            <Select value={purposeFilter} onValueChange={(v) => { setPurposeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-11 enhanced-input">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="visitor">Visitor</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-11 enhanced-input">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        right={
          <Button variant="primary" size="sm" asChild>
            <Link href="/parking/passes/create">
              <Plus className="size-4" />
              Issue Pass
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader icon={KeySquare}>
          <CardTitle>Passes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="overflow-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                    <TableRow>
                      <TableHead>Issued To</TableHead>
                      <TableHead>Vehicle #</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Valid From</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Pass Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No parking passes found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((pass: Record<string, unknown>) => {
                        const id = (pass._id ?? pass.id) as string;
                        const issuedTo = pass.issuedTo as Record<string, string> | string | null;
                        const issuedName =
                          typeof issuedTo === "object" && issuedTo
                            ? issuedTo.memName ?? issuedTo.name ?? "-"
                            : (issuedTo as string) ?? "-";
                        const purpose = (pass.purpose ?? "") as string;
                        const status = (pass.status ?? "active") as string;

                        return (
                          <TableRow key={id}>
                            <TableCell className="font-medium">{issuedName}</TableCell>
                            <TableCell>{(pass.vehicleNumber as string) ?? "-"}</TableCell>
                            <TableCell>
                              <Badge className={PURPOSE_COLORS[purpose] ?? "bg-gray-100 text-gray-800"} variant="outline">
                                {purpose}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(pass.validFrom)}</TableCell>
                            <TableCell>{formatDate(pass.validUntil)}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {(pass.passCode as string) ?? "-"}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge className={STATUS_COLORS[status] ?? ""} variant="outline">
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8">
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleVerify((pass.passCode as string) ?? "")}
                                  >
                                    Verify
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCancel(id)}
                                    className="text-destructive"
                                  >
                                    Cancel
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {data?.pagination && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.pagination.pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
