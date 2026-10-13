"use client";

import { WorkflowForm } from "@/components/workflow/WorkflowForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole, hasPermission } from "@/lib/constants/roles";
import { useCreateWorkflow } from "@/lib/hooks/entities/useWorkflow";
import { useAuth } from "@/lib/hooks/useAuth";
import { CreateWorkflowDto } from "@/lib/types/workflow";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";

export default function CreateWorkflowPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleSubmit = async (data: CreateWorkflowDto) => {
    try {
      setIsSubmitting(true);
      await createMutation.mutateAsync(data);
      customToast.success("Workflow created successfully");
      router.push("/workflows");
    } catch {
      customToast.error("Failed to create workflow");
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
              You don&apos;t have permission to create workflows.
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
        Back to Workflows
      </Button>
      <h1 className="text-3xl font-bold">Create Workflow</h1>
      <p className="text-gray-500 mt-2">Define a new automation workflow</p>
      <div className="mt-6 max-w-4xl">
        <WorkflowForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
