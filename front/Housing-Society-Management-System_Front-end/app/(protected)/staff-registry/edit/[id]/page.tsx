"use client";

import { StaffForm } from "@/components/staff-registry/StaffForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormPageSkeleton } from "@/components/shared/PageSkeleton";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useStaffMember,
  useUpdateStaff,
} from "@/lib/hooks/entities/useStaffRegistry";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateStaff();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: staff, isLoading, error } = useStaffMember(id);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data });
      customToast.success("Staff updated successfully");
      router.push("/staff-registry");
    } catch {
      customToast.error("Failed to update staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.back();

  if (!canUpdate) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit staff records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <FormPageSkeleton />
  }

  if (error || !staff) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load staff record.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaultValues = {
    fullName: staff.fullName,
    cnic: staff.cnic,
    phone: staff.phone,
    gender: staff.gender,
    staffType: staff.staffType,
    address: staff.address || "",
    skills: Array.isArray(staff.skills) ? staff.skills.join(", ") : staff.skills || "",
    languages: Array.isArray(staff.languages) ? staff.languages.join(", ") : staff.languages || "",
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Staff Registry
      </Button>
      <h1 className="text-3xl font-bold">Edit Staff</h1>
      <p className="text-gray-500 mt-2">Update staff information</p>
      <div className="mt-6 max-w-4xl">
        <StaffForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
