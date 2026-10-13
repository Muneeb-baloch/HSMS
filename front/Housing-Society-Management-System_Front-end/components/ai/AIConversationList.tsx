"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAIConversations,
  useDeleteAIConversation,
  useArchiveAIConversation,
} from "@/lib/hooks/entities/useAI";
import { AIConversation } from "@/lib/types/ai";
import {
  Loader2,
  Plus,
  MessageSquare,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react";
import { customToast } from "@/lib/utils/customToast";
import { useConfirm } from "@/components/shared/ConfirmDialog";

const AGENT_TYPE_LABELS: Record<string, string> = {
  "resident-assistant": "Resident Assistant",
  "committee-advisor": "Committee Advisor",
  "financial-analyst": "Financial Analyst",
  "compliance-monitor": "Compliance Monitor",
};

const AGENT_TYPE_COLORS: Record<string, string> = {
  "resident-assistant": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "committee-advisor": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "financial-analyst": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "compliance-monitor": "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export function AIConversationList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { confirm } = useConfirm();
  const [limit] = useState(15);
  const [agentTypeFilter, setAgentTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const queryParams = {
    page,
    limit,
    ...(agentTypeFilter !== "all" && { agentType: agentTypeFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const { data, isLoading, isError } = useAIConversations(queryParams);
  const deleteMutation = useDeleteAIConversation();
  const archiveMutation = useArchiveAIConversation();

  const conversations = data?.items || [];
  const pagination = data?.pagination;

  const handleOpen = (id: string) => {
    router.push(`/ai/chat/${id}`);
  };

  const handleArchive = (id: string) => {
    archiveMutation.mutate(id);
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ title: "Delete", description: "Are you sure you want to delete this conversation?", variant: "destructive" })) return;
    deleteMutation.mutate(id);
  };

  const handleNewConversation = () => {
    router.push("/ai/chat");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Conversations
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your AI assistant conversations
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleNewConversation}>
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Agent Type:</span>
          <Select value={agentTypeFilter} onValueChange={setAgentTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="resident-assistant">
                Resident Assistant
              </SelectItem>
              <SelectItem value="committee-advisor">
                Committee Advisor
              </SelectItem>
              <SelectItem value="financial-analyst">
                Financial Analyst
              </SelectItem>
              <SelectItem value="compliance-monitor">
                Compliance Monitor
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-muted-foreground">
              Failed to load conversations. Please try again.
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No conversations found
              </p>
              <Button variant="outline" onClick={handleNewConversation}>
                <Plus className="h-4 w-4 mr-2" />
                Start a Conversation
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Agent Type</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversations.map((conv: AIConversation) => (
                    <TableRow
                      key={conv._id}
                      className="cursor-pointer"
                      onClick={() => handleOpen(conv._id)}
                    >
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {conv.title || "Untitled Conversation"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                            AGENT_TYPE_COLORS[conv.agentType] || ""
                          }`}
                        >
                          {AGENT_TYPE_LABELS[conv.agentType] || conv.agentType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{conv.messageCount}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {conv.lastMessageAt
                          ? formatDate(conv.lastMessageAt)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            conv.status === "active" ? "success" : "secondary"
                          }
                        >
                          {conv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(conv.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpen(conv._id)}
                            title="Open"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {conv.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchive(conv._id)}
                              title="Archive"
                              disabled={archiveMutation.isPending}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(conv._id)}
                            title="Delete"
                            disabled={deleteMutation.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages} (
                    {pagination.total} total)
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
