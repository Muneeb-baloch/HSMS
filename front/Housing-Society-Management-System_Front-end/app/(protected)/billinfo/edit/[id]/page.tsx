"use client";

import { BillForm } from "@/components/billinfo/BillForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useBill, useUpdateBill } from "@/lib/hooks/entities/useBillInfo";
import { useAuth } from "@/lib/hooks/useAuth";
import { UpdateBillInfoDto } from "@/lib/types/billInfo";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditBillPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { data: bill, isLoading } = useBill(id);
  const updateMutation = useUpdateBill();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: UpdateBillInfoDto) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data });
      customToast.success("Bill updated successfully");
      router.push("/billinfo");
    } catch {
      customToast.error("Failed to update bill");
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
              You don&apos;t have permission to edit bills.
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

  if (isLoading || !bill) {
    return <FormPageSkeleton />
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bills
      </Button>
      <h1 className="text-3xl font-bold">Edit Bill</h1>
      <p className="text-muted-foreground mt-2">
        Edit bill {bill.billNo}
      </p>
      <div className="mt-6 max-w-4xl">
        <BillForm
          mode="edit"
          defaultValues={bill}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
