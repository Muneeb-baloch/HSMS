"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  usePoll,
  usePollResults,
  useCastVote,
  useClosePoll,
} from "@/lib/hooks/entities/usePoll";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Loader2,
  Vote,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface PollViewProps {
  id: string;
}

export function PollView({ id }: PollViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: poll, isLoading } = usePoll(id);
  const { data: results } = usePollResults(id);
  const castVote = useCastVote();
  const closePoll = useClosePoll();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { confirm } = useConfirm();

  const isAdmin =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const isActive = poll?.status === "active";
  const hasVoted = poll?.hasVoted || results?.hasVoted;

  const handleVote = async () => {
    if (!selectedOption) return;
    await castVote.mutateAsync({
      pollId: id,
      data: { optionId: selectedOption },
    });
    setSelectedOption(null);
  };

  const handleClose = async () => {
    if (await confirm({ title: "Close", description: "Are you sure you want to close this poll?" })) {
      await closePoll.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Poll not found.
      </div>
    );
  }

  const pollOptions = (poll.options as Array<Record<string, unknown>>) || [];
  const resultOptions =
    (results?.options as Array<Record<string, unknown>>) || [];
  const totalVotes =
    (results?.totalVotes as number) ??
    (poll.totalVotes as number) ??
    resultOptions.reduce(
      (sum: number, o: Record<string, unknown>) => sum + ((o.votes as number) || 0),
      0
    );

  const showVotingUI = isActive && !hasVoted;
  const showResults = !isActive || hasVoted;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/polls")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{poll.title as string}</h1>
          {poll.description && (
            <p className="text-muted-foreground mt-1">
              {poll.description as string}
            </p>
          )}
        </div>
        <Badge
          className={
            isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
          }
        >
          {isActive ? "Active" : "Closed"}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          Type:{" "}
          <Badge variant="outline">{poll.pollType as string}</Badge>
        </span>
        {poll.startDate && (
          <span>
            Start: {new Date(poll.startDate as string).toLocaleDateString()}
          </span>
        )}
        {poll.endDate && (
          <span>
            End: {new Date(poll.endDate as string).toLocaleDateString()}
          </span>
        )}
        <span>Total Votes: {totalVotes}</span>
        {poll.isAnonymous && (
          <Badge variant="outline">Anonymous</Badge>
        )}
      </div>

      {showVotingUI && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="size-5" />
              Cast Your Vote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pollOptions.map((option) => {
              const optId =
                (option._id as string) || (option.id as string) || "";
              return (
                <button
                  key={optId}
                  type="button"
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedOption === optId
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedOption(optId)}
                >
                  <div className="font-medium">
                    {option.text as string}
                  </div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {option.description as string}
                    </div>
                  )}
                </button>
              );
            })}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleVote}
                disabled={!selectedOption || castVote.isPending}
              >
                {castVote.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Submit Vote
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(resultOptions.length > 0 ? resultOptions : pollOptions).map(
              (option) => {
                const optId =
                  (option._id as string) || (option.id as string) || "";
                const votes = (option.votes as number) || 0;
                const percentage =
                  totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

                return (
                  <div key={optId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {option.text as string}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {votes} vote{votes !== 1 ? "s" : ""} ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                    {option.description && (
                      <p className="text-xs text-muted-foreground">
                        {option.description as string}
                      </p>
                    )}
                  </div>
                );
              }
            )}

            {hasVoted && isActive && (
              <div className="flex items-center gap-2 text-sm text-green-600 pt-2">
                <CheckCircle2 className="size-4" />
                You have already voted in this poll.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isAdmin && isActive && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            onClick={handleClose}
            disabled={closePoll.isPending}
          >
            {closePoll.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            <XCircle className="size-4" />
            Close Poll
          </Button>
        </div>
      )}
    </div>
  );
}
