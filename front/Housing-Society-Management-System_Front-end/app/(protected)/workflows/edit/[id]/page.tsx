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
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useWorkflow,
  useUpdateWorkflow,
} from "@/lib/hooks/entities/useWorkflow";
import { useAuth } from "@/lib/hooks/useAuth";
import { UpdateWorkflowDto } from "@/lib/types/workflow";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: workflow, isLoading, error } = useWorkflow(id);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: UpdateWorkflowDto) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data });
      customToast.success("Workflow updated successfully");
      router.push("/workflows");
    } catch {
      customToast.error("Failed to update workflow");
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
              You don&apos;t have permission to edit workflows.
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

  if (error || !workflow) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load workflow.</CardDescription>
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
    name: workflow.name,
    description: workflow.description || "",
    societyId: workflow.societyId,
    triggerType: workflow.triggerType,
    triggerEntity: workflow.triggerEntity,
    triggerConditions: workflow.triggerConditions,
    steps: workflow.steps || [],
    isActive: workflow.isActive,
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Workflows
      </Button>
      <h1 className="text-3xl font-bold">Edit Workflow</h1>
      <p className="text-gray-500 mt-2">Update workflow configuration</p>
      <div className="mt-6 max-w-4xl">
        <WorkflowForm
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
