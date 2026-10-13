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
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useGatePass,
  useApprovePass,
  useRejectPass,
  useCheckInPass,
  useCheckOutPass,
  useCancelGatePass,
} from "@/lib/hooks/entities/useGatePass";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/format";
import { customToast } from "@/lib/utils/customToast";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  Package,
  Phone,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface GatePassViewProps {
  passId: string;
}

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "requested":
      return "secondary";
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    case "checked_in":
      return "warning";
    case "checked_out":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const getTypeVariant = (
  type: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (type) {
    case "material_in":
    case "furniture_in":
    case "moving_in":
      return "success";
    case "material_out":
    case "furniture_out":
    case "moving_out":
      return "warning";
    default:
      return "secondary";
  }
};

export function GatePassView({ passId }: GatePassViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { confirm } = useConfirm();

  const { data: pass, isLoading, error } = useGatePass(passId);
  const approveMutation = useApprovePass();
  const rejectMutation = useRejectPass();
  const checkInMutation = useCheckInPass();
  const checkOutMutation = useCheckOutPass();
  const cancelMutation = useCancelGatePass();

  const isAdmin =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const isGuard =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(passId);
    } catch {
      customToast.error("Failed to approve gate pass");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await rejectMutation.mutateAsync({ id: passId, data: { reason } });
      } catch {
        customToast.error("Failed to reject gate pass");
      }
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync({ id: passId });
    } catch {
      customToast.error("Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync({ id: passId });
    } catch {
      customToast.error("Failed to check out");
    }
  };

  const handleCancel = async () => {
    if (await confirm({ title: "Cancel", description: "Are you sure you want to cancel this gate pass?" })) {
      try {
        await cancelMutation.mutateAsync(passId);
      } catch {
        customToast.error("Failed to cancel gate pass");
      }
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

  if (error || !pass) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gate Pass Not Found</CardTitle>
          <CardDescription>
            The gate pass you&apos;re looking for doesn&apos;t exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/gate-passes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gate Passes
          </Button>
        </CardContent>
      </Card>
    );
  }

  const passItems = pass.items || [];

  return (
    <div className="space-y-6">
      {/* Pass Code Header */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-sm text-muted-foreground">
                  #{pass.passNumber || pass._id?.slice(-6).toUpperCase()}
                </span>
                <Badge variant={getTypeVariant(pass.passType)}>
                  {pass.passType?.replace(/_/g, " ").toUpperCase()}
                </Badge>
                <Badge variant={getStatusVariant(pass.status)}>
                  {pass.status?.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <span className="text-3xl font-mono font-bold tracking-widest">
                  {pass.passCode || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pass Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {pass.description || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Date</p>
                  <p className="font-medium">{formatDate(pass.expectedDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Time</p>
                  <p className="font-medium">{pass.expectedTime || "N/A"}</p>
                </div>
                {pass.actualEntryTime && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Actual Entry
                    </p>
                    <p className="font-medium text-green-600">
                      {formatDate(pass.actualEntryTime)}
                    </p>
                  </div>
                )}
                {pass.actualExitTime && (
                  <div>
                    <p className="text-sm text-muted-foreground">Actual Exit</p>
                    <p className="font-medium text-blue-600">
                      {formatDate(pass.actualExitTime)}
                    </p>
                  </div>
                )}
                {pass.companyName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{pass.companyName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle & Driver */}
          {(pass.vehicleNumber || pass.driverName) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle & Driver
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pass.vehicleNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Vehicle Number
                      </p>
                      <p className="font-medium font-mono">
                        {pass.vehicleNumber}
                      </p>
                    </div>
                  )}
                  {pass.vehicleType && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Vehicle Type
                      </p>
                      <p className="font-medium capitalize">
                        {pass.vehicleType}
                      </p>
                    </div>
                  )}
                  {pass.driverName && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Driver Name
                      </p>
                      <p className="font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {pass.driverName}
                      </p>
                    </div>
                  )}
                  {pass.driverCNIC && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Driver CNIC
                      </p>
                      <p className="font-mono font-medium">{pass.driverCNIC}</p>
                    </div>
                  )}
                  {pass.driverPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Driver Phone
                      </p>
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {pass.driverPhone}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items Table */}
          {passItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items ({passItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">
                          Item Name
                        </th>
                        <th className="text-left py-2 px-3 font-medium">Qty</th>
                        <th className="text-left py-2 px-3 font-medium">Unit</th>
                        <th className="text-right py-2 px-3 font-medium">
                          Est. Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {passItems.map((item: any, index: number) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-2 px-3">{item.name}</td>
                          <td className="py-2 px-3">{item.quantity}</td>
                          <td className="py-2 px-3">{item.unit}</td>
                          <td className="py-2 px-3 text-right">
                            {item.estimatedValue
                              ? `Rs. ${Number(item.estimatedValue).toLocaleString()}`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {pass.photos?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {pass.photos.map((photo: string, index: number) => (
                    <a
                      key={index}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Actions & Timeline */}
        <div className="space-y-6">
          {/* Admin Actions */}
          {isAdmin && pass.status === "requested" && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Guard Actions */}
          {isGuard && (
            <Card>
              <CardHeader>
                <CardTitle>Guard Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pass.status === "approved" && (
                  <Button
                    className="w-full"
                    onClick={handleCheckIn}
                    disabled={checkInMutation.isPending}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                )}
                {pass.status === "checked_in" && (
                  <Button
                    className="w-full"
                    onClick={handleCheckOut}
                    disabled={checkOutMutation.isPending}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Check Out
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Member Cancel */}
          {(pass.status === "requested" || pass.status === "approved") && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                >
                  Cancel Gate Pass
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(pass.createdAt)}
                    </p>
                  </div>
                </div>
                {pass.approvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Approved</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(pass.approvedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {pass.actualEntryTime && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Checked In</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(pass.actualEntryTime)}
                      </p>
                    </div>
                  </div>
                )}
                {pass.actualExitTime && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Checked Out</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(pass.actualExitTime)}
                      </p>
                    </div>
                  </div>
                )}
                {pass.status === "cancelled" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm font-medium">Cancelled</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(pass.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {pass.status === "rejected" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm font-medium">Rejected</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(pass.updatedAt)}
                      </p>
                      {pass.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {pass.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pass ID:</span>
                <span className="font-mono">{pass._id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(pass.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{formatDate(pass.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
