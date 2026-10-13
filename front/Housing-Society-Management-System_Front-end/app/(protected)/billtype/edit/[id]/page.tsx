"use client";

import { BillTypeForm } from "@/components/billtype/BillTypeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useBillType, useUpdateBillType } from "@/lib/hooks/entities/useBillType";
import { useAuth } from "@/lib/hooks/useAuth";
import { UpdateBillTypeDto } from "@/lib/types/billType";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditBillTypePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { data: billType, isLoading } = useBillType(id);
  const updateMutation = useUpdateBillType();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: UpdateBillTypeDto) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data });
      customToast.success("Bill type updated successfully");
      router.push("/billtype");
    } catch {
      customToast.error("Failed to update bill type");
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
              You don&apos;t have permission to edit bill types.
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

  if (isLoading || !billType) {
    return <FormPageSkeleton />
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bill Types
      </Button>
      <h1 className="text-3xl font-bold">Edit Bill Type</h1>
      <p className="text-muted-foreground mt-2">
        Edit {billType.billTypeName}
      </p>
      <div className="mt-6 max-w-4xl">
        <BillTypeForm
          mode="edit"
          defaultValues={billType}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
