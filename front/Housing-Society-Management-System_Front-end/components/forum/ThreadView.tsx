"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useThread,
  useReplies,
  useCreateReply,
  useLikeThread,
  useLikeReply,
  usePinThread,
  useLockThread,
  useFlagThread,
} from "@/lib/hooks/entities/useForum";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/format";
import { customToast } from "@/lib/utils/customToast";
import {
  ArrowLeft,
  Flag,
  Heart,
  Lock,
  MessageCircle,
  Pin,
  Eye,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface ThreadViewProps {
  threadId: string;
}

export function ThreadView({ threadId }: ThreadViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const { confirm } = useConfirm();
  const [isAnonymousReply, setIsAnonymousReply] = useState(false);

  const { data: thread, isLoading, error } = useThread(threadId);
  const { data: repliesData } = useReplies(threadId);
  const createReplyMutation = useCreateReply();
  const likeThreadMutation = useLikeThread();
  const likeReplyMutation = useLikeReply();
  const pinMutation = usePinThread();
  const lockMutation = useLockThread();
  const flagMutation = useFlagThread();

  const isAdmin =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    try {
      await createReplyMutation.mutateAsync({
        threadId,
        data: {
          content: replyContent,
          isAnonymous: isAnonymousReply,
        },
      });
      setReplyContent("");
      setIsAnonymousReply(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleLikeThread = async () => {
    try {
      await likeThreadMutation.mutateAsync(threadId);
    } catch {
      customToast.error("Failed to like thread");
    }
  };

  const handleLikeReply = async (replyId: string) => {
    try {
      await likeReplyMutation.mutateAsync({ threadId, replyId });
    } catch {
      customToast.error("Failed to like reply");
    }
  };

  const handlePin = async () => {
    try {
      await pinMutation.mutateAsync(threadId);
    } catch {
      customToast.error("Failed to pin thread");
    }
  };

  const handleLock = async () => {
    try {
      await lockMutation.mutateAsync(threadId);
    } catch {
      customToast.error("Failed to lock thread");
    }
  };

  const handleFlag = async () => {
    try {
      await flagMutation.mutateAsync({ id: threadId, data: {} });
    } catch {
      customToast.error("Failed to flag thread");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thread Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The thread you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/forum")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Button>
        </CardContent>
      </Card>
    );
  }

  const replies = repliesData?.items || repliesData || [];

  const renderReply = (reply: any, depth: number = 0) => (
    <div
      key={reply._id}
      className={`border-l-2 border-muted pl-4 py-3 ${depth > 0 ? "ml-6" : ""}`}
    >
      <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {reply.isAnonymous
            ? "Anonymous"
            : reply.author?.memName || reply.author?.firstName || "Unknown"}
        </span>
        <span>{formatDate(reply.createdAt)}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
      <div className="flex items-center gap-3 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => handleLikeReply(reply._id)}
          disabled={likeReplyMutation.isPending}
        >
          <Heart className="h-3 w-3 mr-1" />
          {reply.likeCount ?? reply.likes?.length ?? 0}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={() => {
            if (
              await confirm({ title: "Flag", description: "Are you sure you want to flag this reply?" })
            ) {
              customToast.success("Reply flagged");
            }
          }}
        >
          <Flag className="h-3 w-3 mr-1" />
          Flag
        </Button>
      </div>
      {reply.replies?.map((nested: any) => renderReply(nested, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Original Post */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {thread.isPinned && (
                  <Pin className="h-4 w-4 text-blue-500" />
                )}
                {thread.isLocked && (
                  <Lock className="h-4 w-4 text-yellow-500" />
                )}
                <h1 className="text-2xl font-bold">{thread.title}</h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge>{thread.category?.replace(/_/g, " ")}</Badge>
                {thread.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePin}
                  disabled={pinMutation.isPending}
                >
                  <Pin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLock}
                  disabled={lockMutation.isPending}
                >
                  <Lock className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFlag}
                  disabled={flagMutation.isPending}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
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
            <span>{formatDate(thread.createdAt)}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {thread.viewCount ?? 0}
            </span>
          </div>

          <div className="prose prose-sm max-w-none whitespace-pre-wrap mb-4">
            {thread.content}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeThread}
              disabled={likeThreadMutation.isPending}
            >
              <Heart className="h-4 w-4 mr-1" />
              {thread.likeCount ?? thread.likes?.length ?? 0} Likes
            </Button>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {thread.replyCount ?? replies.length ?? 0} Replies
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Replies Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Replies ({replies.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {replies.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No replies yet. Be the first to respond!
            </p>
          ) : (
            <div className="space-y-1 divide-y">
              {replies.map((reply: any) => renderReply(reply))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Input */}
      {!thread.isLocked && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Post a Reply</h3>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              disabled={createReplyMutation.isPending}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous-reply"
                  checked={isAnonymousReply}
                  onCheckedChange={setIsAnonymousReply}
                  disabled={createReplyMutation.isPending}
                />
                <Label htmlFor="anonymous-reply" className="text-sm">
                  Reply Anonymously
                </Label>
              </div>
              <Button
                onClick={handleSubmitReply}
                disabled={
                  !replyContent.trim() || createReplyMutation.isPending
                }
              >
                <Send className="h-4 w-4 mr-2" />
                {createReplyMutation.isPending ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {thread.isLocked && (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <Lock className="h-5 w-5 mx-auto mb-2" />
            This thread is locked. No more replies can be posted.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
