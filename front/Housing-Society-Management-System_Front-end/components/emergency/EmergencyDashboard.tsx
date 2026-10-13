"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useActiveAlerts,
  useTriggerAlert,
  useRespondToAlert,
  useResolveAlert,
} from "@/lib/hooks/entities/useEmergency";
import {
  AlertTriangle,
  Bell,
  Clock,
  History,
  Loader2,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

export function EmergencyDashboard() {
  const router = useRouter();
  const { data: activeAlerts, isLoading } = useActiveAlerts();
  const triggerAlert = useTriggerAlert();
  const respondToAlert = useRespondToAlert();
  const resolveAlert = useResolveAlert();

  const [alertType, setAlertType] = useState("fire");
  const { confirm } = useConfirm();
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("high");
  const [showForm, setShowForm] = useState(false);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerAlert.mutateAsync({
      type: alertType,
      title: alertTitle,
      description: alertDescription,
      severity: alertSeverity,
    });
    setAlertTitle("");
    setAlertDescription("");
    setShowForm(false);
  };

  const handleRespond = async (id: string) => {
    await respondToAlert.mutateAsync({ id, data: {} });
  };

  const handleResolve = async (id: string) => {
    if (await confirm({ title: "Resolve", description: "Are you sure you want to resolve this alert?" })) {
      await resolveAlert.mutateAsync({ id });
    }
  };

  const alerts = Array.isArray(activeAlerts) ? activeAlerts : [];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge className="bg-red-600 text-white">Critical</Badge>
        );
      case "high":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
            Active
          </Badge>
        );
      case "responding":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Responding
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fire":
        return <AlertTriangle className="size-5 text-red-500" />;
      case "medical":
        return <Stethoscope className="size-5 text-blue-500" />;
      case "security":
        return <ShieldCheck className="size-5 text-orange-500" />;
      default:
        return <Bell className="size-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emergency</h1>
          <p className="text-muted-foreground">
            Trigger and manage emergency alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/emergency/medical")}
          >
            <Stethoscope className="size-4" />
            Medical Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/emergency/history")}
          >
            <History className="size-4" />
            History
          </Button>
        </div>
      </div>

      {/* Trigger Alert Section */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardContent className="pt-6">
          {!showForm ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Button
                size="lg"
                className="h-20 w-full max-w-md bg-red-600 hover:bg-red-700 text-white text-xl font-bold shadow-lg"
                onClick={() => setShowForm(true)}
              >
                <AlertTriangle className="size-8" />
                TRIGGER EMERGENCY ALERT
              </Button>
              <p className="text-sm text-muted-foreground">
                Use this to report an emergency in the society
              </p>
            </div>
          ) : (
            <form onSubmit={handleTrigger} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alertType">Emergency Type</Label>
                  <Select value={alertType} onValueChange={setAlertType}>
                    <SelectTrigger id="alertType" className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="natural_disaster">
                        Natural Disaster
                      </SelectItem>
                      <SelectItem value="gas_leak">Gas Leak</SelectItem>
                      <SelectItem value="flood">Flood</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertSeverity">Severity</Label>
                  <Select value={alertSeverity} onValueChange={setAlertSeverity}>
                    <SelectTrigger id="alertSeverity" className="h-11">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertTitle">Title</Label>
                <Input
                  id="alertTitle"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="Brief description of emergency"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertDescription">Details</Label>
                <Textarea
                  id="alertDescription"
                  value={alertDescription}
                  onChange={(e) => setAlertDescription(e.target.value)}
                  placeholder="Provide additional details about the emergency"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={triggerAlert.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={triggerAlert.isPending}
                >
                  {triggerAlert.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  <AlertTriangle className="size-4" />
                  Trigger Alert
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5 text-red-500" />
            Active Alerts
            {alerts.length > 0 && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="size-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">No active alerts</p>
              <p className="text-sm">Everything looks safe right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert: Record<string, unknown>) => (
                <div
                  key={alert._id as string}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-red-50/50 dark:bg-red-950/10"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(alert.type as string)}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {alert.title as string}
                        </span>
                        {getSeverityBadge(alert.severity as string)}
                        {getStatusBadge(alert.status as string)}
                      </div>
                      {alert.description && (
                        <p className="text-sm text-muted-foreground">
                          {alert.description as string}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(
                            alert.createdAt as string
                          ).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {(alert.respondersCount as number) ??
                            (Array.isArray(alert.responders)
                              ? alert.responders.length
                              : 0)}{" "}
                          responder(s)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRespond(alert._id as string)}
                      disabled={respondToAlert.isPending}
                    >
                      {respondToAlert.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Bell className="size-4" />
                      )}
                      Respond
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleResolve(alert._id as string)}
                      disabled={resolveAlert.isPending}
                    >
                      {resolveAlert.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="size-4" />
                      )}
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
