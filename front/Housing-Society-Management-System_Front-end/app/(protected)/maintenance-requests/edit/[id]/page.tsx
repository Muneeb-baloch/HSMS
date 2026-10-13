"use client";

import { MaintenanceForm } from "@/components/maintenance/MaintenanceForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useMaintenanceRequest,
  useUpdateMaintenanceRequest,
} from "@/lib/hooks/entities/useMaintenanceRequest";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditMaintenanceRequestPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateMaintenanceRequest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: request, isLoading, error } = useMaintenanceRequest(id);

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
      customToast.success("Maintenance request updated successfully");
      router.push("/maintenance-requests");
    } catch {
      customToast.error("Failed to update maintenance request");
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
              You don&apos;t have permission to edit maintenance requests.
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

  if (error || !request) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load maintenance request.
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

  const defaultValues = {
    category: request.category || "",
    title: request.title || "",
    description: request.description || "",
    location: request.location || "",
    priority: request.priority || "",
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Maintenance Requests
      </Button>
      <h1 className="text-3xl font-bold">Edit Maintenance Request</h1>
      <p className="text-gray-500 mt-2">Update request information</p>
      <div className="mt-6 max-w-4xl">
        <MaintenanceForm
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
