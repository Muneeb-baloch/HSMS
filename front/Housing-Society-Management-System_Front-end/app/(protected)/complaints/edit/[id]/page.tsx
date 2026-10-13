"use client";

import { ComplaintForm } from "@/components/complaint/ComplaintForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useComplaint,
  useUpdateComplaint,
} from "@/lib/hooks/entities/useComplaint";
import { useAuth } from "@/lib/hooks/useAuth";
import { UpdateComplaintDto } from "@/lib/types/complaint";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditComplaintPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateComplaint();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: complaint, isLoading, error } = useComplaint(id);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: UpdateComplaintDto) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data });
      customToast.success("Complaint updated successfully");
      router.push("/complaints");
    } catch {
      customToast.error("Failed to update complaint");
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
              You don&apos;t have permission to edit complaints.
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

  if (error || !complaint) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load complaint.</CardDescription>
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
    memId: typeof complaint.memId === "object" ? complaint.memId._id : complaint.memId,
    fileId:
      complaint.fileId && typeof complaint.fileId === "object"
        ? complaint.fileId._id
        : complaint.fileId || "",
    compCatId:
      typeof complaint.compCatId === "object"
        ? complaint.compCatId._id
        : complaint.compCatId,
    compTitle: complaint.compTitle,
    compDescription: complaint.compDescription,
    compPriority: complaint.compPriority,
    statusId:
      typeof complaint.statusId === "object"
        ? complaint.statusId._id
        : complaint.statusId,
    assignedTo:
      complaint.assignedTo && typeof complaint.assignedTo === "object"
        ? complaint.assignedTo._id
        : complaint.assignedTo || "",
    attachmentPaths: complaint.attachmentPaths || [],
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Complaints
      </Button>
      <h1 className="text-3xl font-bold">Edit Complaint</h1>
      <p className="text-gray-500 mt-2">Update complaint information</p>
      <div className="mt-6 max-w-4xl">
        <ComplaintForm
          mode="edit"
          defaultValues={{ ...defaultValues, _id: complaint._id } as any}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
