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
  useParkingSpots,
  useAssignSpot,
  useUnassignSpot,
} from "@/lib/hooks/entities/useParking";
import {
  CircleParking,
  Loader2,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const SPOT_TYPE_COLORS: Record<string, string> = {
  resident: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  visitor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  reserved: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  handicap: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  ev_charging: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export function SpotList() {
  const [search, setSearch] = useState("");
  const { confirm } = useConfirm();
  const [spotType, setSpotType] = useState<string>("all");
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page, limit: 20 };
  if (search) params.search = search;
  if (spotType && spotType !== "all") params.type = spotType;

  const { data, isLoading } = useParkingSpots(params);
  const assignMutation = useAssignSpot();
  const unassignMutation = useUnassignSpot();

  const items = Array.isArray(data?.items) ? data.items : [];

  const handleAssign = (id: string) => {
    const memberName = prompt("Enter member name or ID to assign:");
    const vehicleNumber = prompt("Enter vehicle number:");
    if (memberName && vehicleNumber) {
      assignMutation.mutate({ id, data: { assignedTo: memberName, vehicleNumber } });
    }
  };

  const handleUnassign = async (id: string) => {
    if (await confirm({ title: "Unassign", description: "Are you sure you want to unassign this spot?" })) {
      unassignMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parking Spots</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all parking spots
        </p>
      </div>

      <ActionBar
        left={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search spots..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 w-64"
              />
            </div>
            <Select value={spotType} onValueChange={(v) => { setSpotType(v); setPage(1); }}>
              <SelectTrigger className="w-40 h-11 enhanced-input">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="visitor">Visitor</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="handicap">Handicap</SelectItem>
                <SelectItem value="ev_charging">EV Charging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        right={
          <Button variant="primary" size="sm" asChild>
            <Link href="/parking/spots/create">
              <Plus className="size-4" />
              Create Spot
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader icon={CircleParking}>
          <CardTitle>Spots</CardTitle>
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
                      <TableHead>Spot #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Vehicle #</TableHead>
                      <TableHead>Occupied</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          No parking spots found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((spot: Record<string, unknown>) => {
                        const id = (spot._id ?? spot.id) as string;
                        const type = (spot.spotType ?? spot.type ?? "") as string;
                        const assignedTo = spot.assignedTo as Record<string, string> | string | null;
                        const assignedName =
                          typeof assignedTo === "object" && assignedTo
                            ? assignedTo.memName ?? assignedTo.name ?? "-"
                            : (assignedTo as string) ?? "-";
                        return (
                          <TableRow key={id}>
                            <TableCell className="font-medium">{spot.spotNumber as string}</TableCell>
                            <TableCell>
                              <Badge className={SPOT_TYPE_COLORS[type] ?? "bg-gray-100 text-gray-800"} variant="outline">
                                {type.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>{assignedName}</TableCell>
                            <TableCell>{(spot.vehicleNumber as string) ?? "-"}</TableCell>
                            <TableCell>
                              <Badge variant={spot.isOccupied ? "default" : "outline"}>
                                {spot.isOccupied ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>{(spot.location as string) ?? "-"}</TableCell>
                            <TableCell>
                              <Badge className={STATUS_COLORS[(spot.status as string) ?? ""] ?? ""} variant="outline">
                                {(spot.status as string) ?? "active"}
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
                                  <DropdownMenuItem onClick={() => handleAssign(id)}>
                                    Assign
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUnassign(id)}>
                                    Unassign
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

              {/* Pagination */}
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
