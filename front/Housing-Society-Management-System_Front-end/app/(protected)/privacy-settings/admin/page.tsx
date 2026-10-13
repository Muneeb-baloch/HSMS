"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { usePrivacyScore } from "@/lib/hooks/entities/usePrivacy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Loader2,
  Shield,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function PrivacyAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: scoreData, isLoading, isError } = usePrivacyScore();

  const canAccess =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  if (!canAccess) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          You do not have permission to view this page.
        </p>
        <Button variant="outline" onClick={() => router.push("/privacy")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Privacy Settings
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (isError || !scoreData) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <p className="text-muted-foreground">
          Failed to load privacy score data. Please try again later.
        </p>
      </div>
    );
  }

  const score = scoreData.score;
  const factors = scoreData.factors || {};

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-yellow-500";
    if (s >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBadge = (s: number) => {
    if (s >= 80) return { label: "Excellent", variant: "success" as const };
    if (s >= 60) return { label: "Good", variant: "warning" as const };
    if (s >= 40) return { label: "Fair", variant: "warning" as const };
    return { label: "Needs Improvement", variant: "destructive" as const };
  };

  const getProgressColor = (val: number) => {
    if (val >= 80) return "bg-emerald-500";
    if (val >= 60) return "bg-yellow-500";
    if (val >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const scoreBadge = getScoreBadge(score);

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <Button
        variant="ghost"
        className="mb-6 w-fit"
        onClick={() => router.push("/privacy")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Privacy Settings
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Privacy Administration
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor society-wide privacy compliance and scores
        </p>
      </div>

      <div className="space-y-6">
        {/* Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div
                className={`text-7xl font-bold ${getScoreColor(score)} mb-3`}
              >
                {score}
              </div>
              <p className="text-sm text-muted-foreground mb-2">out of 100</p>
              <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(factors).length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No score factors available
                </p>
              ) : (
                Object.entries(factors).map(([factor, value]) => {
                  const numValue = typeof value === "number" ? value : 0;
                  return (
                    <div key={factor} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {factor.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {numValue}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressColor(numValue)}`}
                          style={{ width: `${Math.min(numValue, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Member Privacy Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Privacy Access Logs</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review all data access events across the society
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/privacy/access-log")}
                  >
                    View Access Logs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Privacy Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your own privacy preferences
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/privacy")}
                  >
                    View Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
