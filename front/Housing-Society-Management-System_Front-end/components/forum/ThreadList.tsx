"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useThreads } from "@/lib/hooks/entities/useForum";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/format";
import {
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  Pin,
  Lock,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  "All",
  "General",
  "Maintenance",
  "Security",
  "Events",
  "Suggestions",
  "Lost & Found",
  "Help",
  "Discussion",
] as const;

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
  { label: "Most Replied", value: "most-replied" },
] as const;

const getCategoryVariant = (
  category: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (category?.toLowerCase()) {
    case "maintenance":
      return "warning";
    case "security":
      return "destructive";
    case "events":
      return "success";
    case "suggestions":
      return "secondary";
    default:
      return "default";
  }
};

export function ThreadList() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useThreads({
    page,
    category: activeCategory === "All" ? undefined : activeCategory.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_"),
    sortBy,
    search: search || undefined,
  });

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleCreateThread = () => router.push("/forum/create");
  const handleViewThread = (id: string) => router.push(`/forum/thread/${id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">
            Discuss topics with your community members
          </p>
        </div>
        {canCreate && (
          <Button variant="primary" size="sm" onClick={handleCreateThread}>
            <Plus className="size-4" />
            Create Thread
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveCategory(cat);
              setPage(1);
            }}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={sortBy === opt.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setSortBy(opt.value);
                setPage(1);
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Thread Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !data?.items?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No threads found. Be the first to start a discussion!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.items.map((thread: any) => (
            <Card
              key={thread._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewThread(thread._id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {thread.isPinned && (
                        <Pin className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                      {thread.isLocked && (
                        <Lock className="h-4 w-4 text-yellow-500 shrink-0" />
                      )}
                      <h3 className="font-semibold text-lg truncate">
                        {thread.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={getCategoryVariant(thread.category)}>
                        {thread.category?.replace(/_/g, " ")}
                      </Badge>
                      {thread.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {thread.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>
                        By{" "}
                        <span className="font-medium text-foreground">
                          {thread.isAnonymous
                            ? "Anonymous"
                            : thread.author?.memName ||
                              thread.author?.firstName ||
                              "Unknown"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {thread.replyCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {thread.viewCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {thread.likeCount ?? thread.likes?.length ?? 0}
                      </span>
                      {thread.lastReplyAt && (
                        <span className="hidden sm:inline">
                          Last reply {formatDate(thread.lastReplyAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
