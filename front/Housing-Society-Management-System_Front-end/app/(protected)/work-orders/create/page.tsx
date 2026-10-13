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
import { UserRole, hasPermission } from "@/lib/constants/roles";
import { useCreateWorkOrder } from "@/lib/hooks/entities/useVendor";
import { useAuth } from "@/lib/hooks/useAuth";
import { CreateWorkOrderDto } from "@/lib/types/vendor";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateWorkOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateWorkOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleSubmit = async (data: CreateWorkOrderDto) => {
    try {
      setIsSubmitting(true);
      await createMutation.mutateAsync(data as CreateWorkOrderDto);
      router.push("/work-orders");
    } catch {
      customToast.error("Failed to create work order");
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
              You don&apos;t have permission to create work orders.
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
        Back to Work Orders
      </Button>
      <h1 className="text-3xl font-bold">Create Work Order</h1>
      <p className="text-gray-500 mt-2">Submit a new work order</p>
      <div className="mt-6 max-w-4xl">
        <WorkOrderForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
