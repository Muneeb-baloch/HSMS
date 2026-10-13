"use client";

import { WorkOrderForm } from "@/components/vendor/WorkOrderForm";
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
  useWorkOrder,
  useUpdateWorkOrder,
} from "@/lib/hooks/entities/useVendor";
import { useAuth } from "@/lib/hooks/useAuth";
import { UpdateWorkOrderDto } from "@/lib/types/vendor";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditWorkOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateWorkOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: workOrder, isLoading, error } = useWorkOrder(id);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: UpdateWorkOrderDto) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data: data as UpdateWorkOrderDto });
      router.push("/work-orders");
    } catch {
      customToast.error("Failed to update work order");
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
              You don&apos;t have permission to edit work orders.
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

  if (error || !workOrder) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load work order.</CardDescription>
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
    title: workOrder.title,
    description: workOrder.description,
    category: workOrder.category,
    estimatedBudget: workOrder.estimatedBudget,
    deadline: workOrder.deadline,
    scope: workOrder.scope || "",
    societyId: typeof workOrder.societyId === "object"
      ? (workOrder.societyId as { _id: string })._id
      : workOrder.societyId,
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Work Orders
      </Button>
      <h1 className="text-3xl font-bold">Edit Work Order</h1>
      <p className="text-gray-500 mt-2">Update work order details</p>
      <div className="mt-6 max-w-4xl">
        <WorkOrderForm
          mode="edit"
          defaultValues={{ ...defaultValues, _id: workOrder._id }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
