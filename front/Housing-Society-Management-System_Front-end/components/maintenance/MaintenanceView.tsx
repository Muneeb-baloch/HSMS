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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useMaintenanceRequest,
  useAcknowledgeRequest,
  useAssignToStaff,
  useAssignToVendor,
  useStartWork,
  useCompleteWork,
  useVerifyCompletion,
  useRejectRequest,
  useSubmitFeedback,
} from "@/lib/hooks/entities/useMaintenanceRequest";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/format";
import { customToast } from "@/lib/utils/customToast";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  User,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MaintenanceViewProps {
  requestId: string;
}

const getPriorityVariant = (
  priority: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (priority) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
      return "default";
    case "urgent":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "submitted":
      return "secondary";
    case "acknowledged":
      return "default";
    case "in_progress":
      return "warning";
    case "completed":
    case "verified":
      return "success";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

export function MaintenanceView({ requestId }: MaintenanceViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");

  const { data: request, isLoading, error } = useMaintenanceRequest(requestId);
  const acknowledgeMutation = useAcknowledgeRequest();
  const assignStaffMutation = useAssignToStaff();
  const assignVendorMutation = useAssignToVendor();
  const startWorkMutation = useStartWork();
  const completeMutation = useCompleteWork();
  const verifyMutation = useVerifyCompletion();
  const rejectMutation = useRejectRequest();
  const feedbackMutation = useSubmitFeedback();

  const isAdmin =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleAcknowledge = async () => {
    try {
      await acknowledgeMutation.mutateAsync(requestId);
    } catch {
      customToast.error("Failed to acknowledge request");
    }
  };

  const handleAssignStaff = async () => {
    const staffId = prompt("Enter staff member ID:");
    if (staffId) {
      try {
        await assignStaffMutation.mutateAsync({
          id: requestId,
          data: { staffId },
        });
      } catch {
        customToast.error("Failed to assign staff");
      }
    }
  };

  const handleAssignVendor = async () => {
    const vendorId = prompt("Enter vendor ID:");
    if (vendorId) {
      try {
        await assignVendorMutation.mutateAsync({
          id: requestId,
          data: { vendorId },
        });
      } catch {
        customToast.error("Failed to assign vendor");
      }
    }
  };

  const handleStartWork = async () => {
    try {
      await startWorkMutation.mutateAsync(requestId);
    } catch {
      customToast.error("Failed to start work");
    }
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync({ id: requestId });
    } catch {
      customToast.error("Failed to mark as complete");
    }
  };

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync({ id: requestId, data: {} });
    } catch {
      customToast.error("Failed to verify completion");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await rejectMutation.mutateAsync({
          id: requestId,
          data: { reason },
        });
      } catch {
        customToast.error("Failed to reject request");
      }
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      customToast.error("Please select a rating");
      return;
    }
    try {
      await feedbackMutation.mutateAsync({
        id: requestId,
        data: { rating: feedbackRating, comment: feedbackComment },
      });
      setFeedbackRating(0);
      setFeedbackComment("");
    } catch {
      customToast.error("Failed to submit feedback");
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

  if (error || !request) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request Not Found</CardTitle>
          <CardDescription>
            The maintenance request you&apos;re looking for doesn&apos;t exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/maintenance-requests")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isOverdue =
    request.isOverdue ||
    (request.slaDeadline && new Date(request.slaDeadline) < new Date());
  const workLogs = request.workLog || request.workLogs || [];
  const isCompleted =
    request.status === "completed" || request.status === "verified";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="font-mono text-sm text-muted-foreground">
                  #{request.requestNumber || request._id?.slice(-6).toUpperCase()}
                </span>
                <Badge variant={getPriorityVariant(request.priority)}>
                  {request.priority?.toUpperCase()}
                </Badge>
                <Badge variant={getStatusVariant(request.status)}>
                  {request.status?.replace(/_/g, " ").toUpperCase()}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    OVERDUE
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold">{request.title}</h1>
            </div>
            {request.slaDeadline && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">SLA Deadline</p>
                <p
                  className={`font-medium ${
                    isOverdue ? "text-red-600" : "text-foreground"
                  }`}
                >
                  {formatDate(request.slaDeadline)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Request Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium capitalize">
                {request.category?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{request.location || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requested By</p>
              <p className="font-medium flex items-center gap-1">
                <User className="h-3 w-3" />
                {typeof request.requestedBy === "object"
                  ? request.requestedBy?.memName ||
                    request.requestedBy?.firstName
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned To</p>
              <p className="font-medium">
                {typeof request.assignedTo === "object"
                  ? request.assignedTo?.memName ||
                    request.assignedTo?.firstName
                  : request.assignedTo || "Unassigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Vendor</p>
              <p className="font-medium">
                {typeof request.assignedVendor === "object"
                  ? request.assignedVendor?.name ||
                    request.assignedVendor?.companyName
                  : request.assignedVendor || "None"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Cost</p>
              <p className="font-medium">
                {request.estimatedCost
                  ? `Rs. ${Number(request.estimatedCost).toLocaleString()}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Actual Cost</p>
              <p className="font-medium">
                {request.actualCost
                  ? `Rs. ${Number(request.actualCost).toLocaleString()}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Estimated Completion
              </p>
              <p className="font-medium">
                {formatDate(request.estimatedCompletionDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Actual Completion
              </p>
              <p className="font-medium">
                {formatDate(request.actualCompletionDate)}
              </p>
            </div>
          </div>

          {request.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="whitespace-pre-wrap">{request.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Work Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No work log entries yet.
            </p>
          ) : (
            <div className="space-y-4">
              {workLogs.map((entry: any, index: number) => (
                <div
                  key={entry._id || index}
                  className="flex items-start gap-3 border-l-2 border-muted pl-4 py-2"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 -ml-[21px]" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {entry.description || "Work update"}
                      </p>
                      {entry.hoursWorked && (
                        <Badge variant="secondary">
                          {entry.hoursWorked}h
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(entry.date || entry.createdAt)} | By:{" "}
                      {typeof entry.loggedBy === "object"
                        ? entry.loggedBy?.memName || entry.loggedBy?.firstName
                        : entry.loggedBy || "Unknown"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {isAdmin && !isCompleted && request.status !== "rejected" && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {request.status === "submitted" && (
              <Button
                onClick={handleAcknowledge}
                disabled={acknowledgeMutation.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Acknowledge
              </Button>
            )}
            {(request.status === "submitted" ||
              request.status === "acknowledged") && (
              <>
                <Button
                  variant="outline"
                  onClick={handleAssignStaff}
                  disabled={assignStaffMutation.isPending}
                >
                  Assign Staff
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAssignVendor}
                  disabled={assignVendorMutation.isPending}
                >
                  Assign Vendor
                </Button>
              </>
            )}
            {request.status === "acknowledged" && (
              <Button
                onClick={handleStartWork}
                disabled={startWorkMutation.isPending}
              >
                Start Work
              </Button>
            )}
            {request.status === "in_progress" && (
              <Button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
              >
                Complete
              </Button>
            )}
            {request.status === "completed" && (
              <Button
                onClick={handleVerify}
                disabled={verifyMutation.isPending}
              >
                Verify
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              Reject
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feedback Section */}
      {isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {request.feedback ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= (request.feedback?.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({request.feedback.rating}/5)
                  </span>
                </div>
                {request.feedback.comment && (
                  <p className="text-sm">{request.feedback.comment}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Rating
                  </Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`h-6 w-6 cursor-pointer transition-colors ${
                            star <= feedbackRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="feedback-comment" className="text-sm font-medium mb-2 block">
                    Comment (optional)
                  </Label>
                  <Textarea
                    id="feedback-comment"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    disabled={feedbackMutation.isPending}
                  />
                </div>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={
                    feedbackRating === 0 || feedbackMutation.isPending
                  }
                >
                  Submit Feedback
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
