"use client";

import { ComplaintForm } from "@/components/complaint/ComplaintForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole, hasPermission } from "@/lib/constants/roles";
import { useCreateComplaint } from "@/lib/hooks/entities/useComplaint";
import { useAuth } from "@/lib/hooks/useAuth";
import { CreateComplaintDto } from "@/lib/types/complaint";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";

export default function CreateComplaintPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateComplaint();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [

      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleSubmit = async (data: CreateComplaintDto) => {
    try {
      setIsSubmitting(true);
      await createMutation.mutateAsync(data);
      customToast.success("Complaint created successfully");
      router.push("/complaints");
    } catch {
      customToast.error("Failed to create complaint");
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
              You don&apos;t have permission to create complaints.
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
        Back to Complaints
      </Button>
      <h1 className="text-3xl font-bold">Create Complaint</h1>
      <p className="text-gray-500 mt-2">Submit a new complaint</p>
      <div className="mt-6 max-w-4xl">
        <ComplaintForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
