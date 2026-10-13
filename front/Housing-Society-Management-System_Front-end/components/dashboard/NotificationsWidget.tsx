"use client";

import Link from "next/link";
import { IconBell, IconSpeakerphone } from "@tabler/icons-react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/dashboard/GlassCard";
import type { Complaint } from "@/lib/types/complaint";
import { useAnnouncements } from "@/lib/hooks/entities/useAnnouncements";
import { useComplaints } from "@/lib/hooks/entities/useComplaint";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationsWidget() {
  const announcements = useAnnouncements({ page: 1, limit: 5 });
  const complaints = useComplaints({ page: 1, limit: 5 });

  const annItems = (announcements.data as { announcements?: Array<{ _id: string; title?: string; createdAt?: string; content?: string }> })?.announcements ?? [];
  const compItems = (complaints.data?.items ?? []) as Complaint[];
  const hasItems = annItems.length > 0 || compItems.length > 0;

  return (
    <GlassCard variant="glass-soft" delay={270} aria-label="Recent announcements and complaints">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBell className="size-5 text-blue-500 dark:text-blue-400" aria-hidden />
          Notifications
        </CardTitle>
        <CardDescription>Recent announcements & complaints</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[180px] overflow-y-auto">
          {announcements.isLoading || complaints.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" aria-hidden />
              ))}
            </div>
          ) : !hasItems ? (
            <p className="text-sm text-muted-foreground">No recent notifications.</p>
          ) : (
            <>
              {annItems.slice(0, 3).map((a) => (
                <Link
                  key={a._id}
                  href="/announcements"
                  className={cn(
                    "flex items-start gap-2 rounded-lg border border-white/5 p-2",
                    "transition-colors hover:bg-primary/5 hover:border-primary/10"
                  )}
                  aria-label={`Announcement: ${a.title ?? "Untitled"}`}
                >
                  <IconSpeakerphone className="mt-0.5 size-4 shrink-0 text-violet-500 dark:text-violet-400" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title ?? "Announcement"}</p>
                    {a.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              {compItems.slice(0, 2).map((c) => (
                <Link
                  key={c._id}
                  href="/complaints"
                  className={cn(
                    "flex items-start gap-2 rounded-lg border border-white/5 p-2",
                    "transition-colors hover:bg-primary/5 hover:border-primary/10"
                  )}
                  aria-label={`Complaint: ${c.compTitle ?? "Complaint"}`}
                >
                  <IconBell className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.compTitle ?? "Complaint"}</p>
                    {c.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
