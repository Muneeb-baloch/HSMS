"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { SummaryCard } from "@/components/shared/SummaryCard";
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
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  usePolls,
  useClosePoll,
  useDeletePoll,
} from "@/lib/hooks/entities/usePoll";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

export function PollList() {
  const router = useRouter();
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [filters, setFilters] = useState<Record<string, unknown>>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = usePolls(filters);
  const closePoll = useClosePoll();
  const deletePoll = useDeletePoll();

  const isAdmin =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR,
    ]);

  const items = data?.items || [];

  const totalPolls = items.length;
  const activePolls = items.filter(
    (p: Record<string, unknown>) => p.status === "active"
  ).length;
  const closedPolls = items.filter(
    (p: Record<string, unknown>) => p.status === "closed"
  ).length;

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleTypeFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      type: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleClose = async (id: string) => {
    if (await confirm({ title: "Close", description: "Are you sure you want to close this poll?" })) {
      await closePoll.mutateAsync(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Active
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
            Closed
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "single_choice":
        return <Badge variant="outline">Single Choice</Badge>;
      case "multiple_choice":
        return <Badge variant="outline">Multiple Choice</Badge>;
      case "yes_no":
        return <Badge variant="outline">Yes/No</Badge>;
      case "rating":
        return <Badge variant="outline">Rating</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Polls</h1>
        <p className="text-muted-foreground">
          Create and manage society polls and surveys
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Polls"
          value={totalPolls}
          icon={BarChart3}
          iconBgClassName="bg-blue-100"
          iconClassName="text-blue-600"
        />
        <SummaryCard
          title="Active"
          value={activePolls}
          icon={Clock}
          iconBgClassName="bg-green-100"
          iconClassName="text-green-600"
          valueClassName="text-green-600"
        />
        <SummaryCard
          title="Closed"
          value={closedPolls}
          icon={CheckCircle2}
          iconBgClassName="bg-gray-100"
          iconClassName="text-gray-600"
          valueClassName="text-gray-600"
        />
      </div>

      <ActionBar
        left={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search polls..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-9 w-[200px]"
              />
            </div>
            <Select onValueChange={handleStatusFilter}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={handleTypeFilter}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="single_choice">Single Choice</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="yes_no">Yes/No</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        right={
          canCreate && (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/polls/create")}
            >
              <Plus className="size-4" />
              Create Poll
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Polls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No polls found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Voters</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((poll: Record<string, unknown>) => (
                    <TableRow key={poll._id as string}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {poll.title as string}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(poll.pollType as string)}
                      </TableCell>
                      <TableCell>
                        {Array.isArray(poll.options)
                          ? poll.options.length
                          : 0}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(poll.status as string)}
                      </TableCell>
                      <TableCell>
                        {formatDate(poll.startDate as string)}
                      </TableCell>
                      <TableCell>
                        {formatDate(poll.endDate as string)}
                      </TableCell>
                      <TableCell>
                        {(poll.totalVotes as number) ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() =>
                              router.push(`/polls/view/${poll._id}`)
                            }
                          >
                            <Eye className="size-4" />
                          </Button>
                          {isAdmin && poll.status === "active" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleClose(poll._id as string)}
                              disabled={closePoll.isPending}
                            >
                              <XCircle className="size-4 text-red-500" />
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
