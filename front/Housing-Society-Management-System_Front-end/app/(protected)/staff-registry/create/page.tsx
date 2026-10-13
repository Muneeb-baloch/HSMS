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
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useRegisterStaff } from "@/lib/hooks/entities/useStaffRegistry";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateStaffPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useRegisterStaff();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      await createMutation.mutateAsync(data);
      router.push("/staff-registry");
    } catch {
      customToast.error("Failed to register staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.back();

  if (!canCreate) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to register staff.
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

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Staff Registry
      </Button>
      <h1 className="text-3xl font-bold">Register Staff</h1>
      <p className="text-gray-500 mt-2">Add a new domestic staff member</p>
      <div className="mt-6 max-w-4xl">
        <StaffForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
