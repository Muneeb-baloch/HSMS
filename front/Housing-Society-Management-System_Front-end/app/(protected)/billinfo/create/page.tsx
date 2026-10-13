"use client";

import { BillForm } from "@/components/billinfo/BillForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useCreateBill } from "@/lib/hooks/entities/useBillInfo";
import { useAuth } from "@/lib/hooks/useAuth";
import { CreateBillInfoDto } from "@/lib/types/billInfo";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";

export default function CreateBillPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateBill();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: CreateBillInfoDto) => {
    try {
      setIsSubmitting(true);
      await createMutation.mutateAsync(data);
      customToast.success("Bill created successfully");
      router.push("/billinfo");
    } catch {
      customToast.error("Failed to create bill");
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
              You don&apos;t have permission to create bills.
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
        Back to Bills
      </Button>
      <h1 className="text-3xl font-bold">Create Bill</h1>
      <p className="text-muted-foreground mt-2">Add a new bill</p>
      <div className="mt-6 max-w-4xl">
        <BillForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
