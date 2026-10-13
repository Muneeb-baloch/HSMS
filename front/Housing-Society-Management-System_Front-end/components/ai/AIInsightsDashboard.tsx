"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole, hasPermission } from "@/lib/constants/roles";
import {
  useAIInsights,
  useAcknowledgeAIInsight,
  useDashboardInsights,
} from "@/lib/hooks/entities/useAI";
import { useAuth } from "@/lib/hooks/useAuth";
import { AIInsight } from "@/lib/types/ai";
import { customToast } from "@/lib/utils/customToast";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Lightbulb,
  Loader2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

const severityColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const typeIcons: Record<string, React.ReactNode> = {
  prediction: <TrendingUp className="h-4 w-4" />,
  anomaly: <AlertTriangle className="h-4 w-4" />,
  recommendation: <Lightbulb className="h-4 w-4" />,
  trend: <TrendingUp className="h-4 w-4" />,
  alert: <Zap className="h-4 w-4" />,
};

type TabType = "all" | "prediction" | "anomaly" | "recommendation" | "alert";

export function AIInsightsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [page, setPage] = useState(1);

  const canView =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const insightParams = {
    page,
    limit: 20,
    ...(activeTab !== "all" ? { insightType: activeTab } : {}),
  };

  const { data: insights, isLoading } = useAIInsights(insightParams);
  const { data: dashboardInsights } = useDashboardInsights();
  const acknowledgeMutation = useAcknowledgeAIInsight();

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeMutation.mutateAsync(id);
      customToast.success("Insight acknowledged");
    } catch {
      customToast.error("Failed to acknowledge insight");
    }
  };

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to view AI insights.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tabs: { value: TabType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "prediction", label: "Predictions" },
    { value: "anomaly", label: "Anomalies" },
    { value: "recommendation", label: "Recommendations" },
    { value: "alert", label: "Alerts" },
  ];

  const insightItems: AIInsight[] = Array.isArray(insights)
    ? insights
    : insights?.insights || insights?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground mt-1">
          AI-generated predictions, anomalies, and recommendations
        </p>
      </div>

      {/* Summary Cards */}
      {dashboardInsights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Insights
                  </p>
                  <p className="text-2xl font-bold">
                    {Array.isArray(dashboardInsights)
                      ? dashboardInsights.length
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold">
                    {Array.isArray(dashboardInsights)
                      ? dashboardInsights.filter(
                          (i: AIInsight) => i.severity === "critical"
                        ).length
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Actionable</p>
                  <p className="text-2xl font-bold">
                    {Array.isArray(dashboardInsights)
                      ? dashboardInsights.filter(
                          (i: AIInsight) => i.actionable
                        ).length
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Acknowledged</p>
                  <p className="text-2xl font-bold">
                    {Array.isArray(dashboardInsights)
                      ? dashboardInsights.filter(
                          (i: AIInsight) => i.acknowledgedAt
                        ).length
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Insights Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : insightItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No insights found for this category.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insightItems.map((insight: AIInsight) => (
            <Card key={insight._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {typeIcons[insight.insightType] || (
                      <Eye className="h-4 w-4" />
                    )}
                    <CardTitle className="text-base">
                      {insight.title}
                    </CardTitle>
                  </div>
                  <Badge
                    className={
                      severityColors[insight.severity] || severityColors.info
                    }
                  >
                    {insight.severity}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{insight.insightType}</Badge>
                  <Badge variant="secondary">{insight.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {new Date(insight.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    {insight.actionable && insight.actionUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(insight.actionUrl, "_blank")
                        }
                      >
                        Take Action
                      </Button>
                    )}
                    {!insight.acknowledgedAt && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAcknowledge(insight._id)}
                        disabled={acknowledgeMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    {insight.acknowledgedAt && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {insightItems.length > 0 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={insightItems.length < 20}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
