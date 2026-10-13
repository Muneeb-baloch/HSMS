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
  useStaffMember,
  useVerifyStaff,
  useBlacklistStaff,
  useAddEmployment,
  useEndEmployment,
} from "@/lib/hooks/entities/useStaffRegistry";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/format";
import { customToast } from "@/lib/utils/customToast";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldAlert,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface StaffViewProps {
  staffId: string;
}

const renderStars = (rating: number) => {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-4 w-4 ${
          i <= rounded ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export function StaffView({ staffId }: StaffViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { confirm } = useConfirm();

  const { data: staff, isLoading, error } = useStaffMember(staffId);
  const verifyMutation = useVerifyStaff();
  const blacklistMutation = useBlacklistStaff();
  const addEmploymentMutation = useAddEmployment();
  const endEmploymentMutation = useEndEmployment();

  const isAdmin =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync({ id: staffId, data: { method: "cnic_check" } });
    } catch {
      customToast.error("Failed to verify staff");
    }
  };

  const handleBlacklist = async () => {
    if (await confirm({ title: "Blacklist", description: "Are you sure you want to blacklist this staff member?", variant: "destructive" })) {
      try {
        await blacklistMutation.mutateAsync({
          id: staffId,
          data: { reason: "Blacklisted by admin" },
        });
      } catch {
        customToast.error("Failed to blacklist staff");
      }
    }
  };

  const handleAddEmployment = async () => {
    const society = prompt("Enter society name:");
    const role = prompt("Enter role:");
    if (society && role) {
      try {
        await addEmploymentMutation.mutateAsync({
          id: staffId,
          data: { society, role, startDate: new Date().toISOString() },
        });
      } catch {
        customToast.error("Failed to add employment");
      }
    }
  };

  const handleEndEmployment = async (employmentId: string) => {
    if (await confirm({ title: "Confirm", description: "Are you sure you want to end this employment?" })) {
      try {
        await endEmploymentMutation.mutateAsync({
          id: staffId,
          employmentId,
          data: { endDate: new Date().toISOString() },
        });
      } catch {
        customToast.error("Failed to end employment");
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

  if (error || !staff) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Not Found</CardTitle>
          <CardDescription>
            The staff record you&apos;re looking for doesn&apos;t exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/staff-registry")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const employmentHistory = staff.employmentHistory || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">{staff.fullName}</h2>
            <Badge className="mt-2">
              {staff.staffType?.replace(/_/g, " ").toUpperCase()}
            </Badge>
            <div className="flex items-center justify-center gap-2 mt-2">
              {staff.isVerified ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
              {staff.isBlacklisted && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  Blacklisted
                </Badge>
              )}
            </div>
            {staff.averageRating != null && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {renderStars(staff.averageRating)}
                <span className="text-sm text-muted-foreground">
                  ({Number(staff.averageRating).toFixed(1)})
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CNIC</p>
                <p className="font-mono font-medium">{staff.cnic || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {staff.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">{staff.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {staff.address || "N/A"}
                </p>
              </div>
              {staff.skills?.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(staff.skills)
                      ? staff.skills
                      : [staff.skills]
                    ).map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {staff.languages?.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(staff.languages)
                      ? staff.languages
                      : [staff.languages]
                    ).map((lang: string) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Employment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employmentHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No employment records found.
            </p>
          ) : (
            <div className="space-y-4">
              {employmentHistory.map((emp: any, index: number) => (
                <div
                  key={emp._id || index}
                  className="flex items-start gap-3 border-l-2 border-muted pl-4 py-2"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 -ml-[21px]" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {emp.society?.name || emp.society || "Unknown Society"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {emp.role || "Staff"}
                        </p>
                      </div>
                      {emp.rating && (
                        <div className="flex items-center gap-1">
                          {renderStars(emp.rating)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(emp.startDate)} -{" "}
                      {emp.endDate ? formatDate(emp.endDate) : "Present"}
                    </p>
                    {isAdmin && !emp.endDate && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleEndEmployment(emp._id)}
                        disabled={endEmploymentMutation.isPending}
                      >
                        End Employment
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {!staff.isVerified && (
              <Button
                onClick={handleVerify}
                disabled={verifyMutation.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify Staff
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleAddEmployment}
              disabled={addEmploymentMutation.isPending}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Add Employment
            </Button>
            {!staff.isBlacklisted && (
              <Button
                variant="destructive"
                onClick={handleBlacklist}
                disabled={blacklistMutation.isPending}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Blacklist
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
