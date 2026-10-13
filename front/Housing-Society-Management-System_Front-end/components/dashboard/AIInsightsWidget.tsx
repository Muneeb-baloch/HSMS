"use client";

import Link from "next/link";
import { IconRobot, IconTrendingUp } from "@tabler/icons-react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { useDefaulterStatistics } from "@/lib/hooks/entities/useDefaulter";
import { useBillDashboardSummary } from "@/lib/hooks/entities/useBillInfo";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

interface AIInsightsWidgetProps {
  userRole: UserRole;
}

export function AIInsightsWidget({ userRole }: AIInsightsWidgetProps) {
  const stats = useDefaulterStatistics();
  const billSummary = useBillDashboardSummary();

  const topDefaulters = stats.data?.topDefaulters ?? [];
  const totalPaid = billSummary.data?.statistics?.totalPaid ?? 0;
  const totalPending = billSummary.data?.statistics?.totalPending ?? 0;
  const canSeeAdmin = hasPermission(userRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const predictedRevenue = totalPaid + totalPending * 0.7;

  return (
    <GlassCard variant="glass-soft" delay={280} aria-label="AI-powered insights">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconRobot className="size-5 text-violet-500 dark:text-violet-400" aria-hidden />
          AI Insights
        </CardTitle>
        <CardDescription>Suggestions and predictions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {canSeeAdmin && topDefaulters.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Top defaulters to follow up
              </p>
              <ul className="space-y-1" role="list">
                {topDefaulters.slice(0, 5).map((d, i) => (
                  <li key={i}>
                    <Link
                      href="/defaulter"
                      className={cn(
                        "flex items-center justify-between rounded px-2 py-1 text-sm",
                        "transition-colors hover:bg-primary/10"
                      )}
                      aria-label={`Follow up: ${d.memName}, ${d.totalAmount} overdue`}
                    >
                      <span className="truncate">{d.memName}</span>
                      <span className="text-muted-foreground tabular-nums">
                        Rs {(d.totalAmount ?? 0).toLocaleString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {canSeeAdmin && (
            <div className="rounded-lg border border-white/5 bg-primary/5 p-3">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <IconTrendingUp className="size-4 text-emerald-500 dark:text-emerald-400" aria-hidden />
                Predicted revenue
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums">
                Rs {Math.round(predictedRevenue).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on current trends and pending bills
              </p>
            </div>
          )}
          {!canSeeAdmin && (
            <p className="text-sm text-muted-foreground">
              Your personalized insights will appear here based on your activity.
            </p>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
