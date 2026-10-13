"use client";

import { CustomFormFieldForm } from "@/components/custom-form/CustomFormFieldForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole, hasPermission } from "@/lib/constants/roles";
import { useCreateCustomForm } from "@/lib/hooks/entities/useCustomForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { CreateCustomFormFieldDto } from "@/lib/types/custom-form";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";

export default function CreateCustomFormPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateCustomForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleSubmit = async (data: CreateCustomFormFieldDto) => {
    try {
      setIsSubmitting(true);
      await createMutation.mutateAsync(data);
      customToast.success("Custom form field created successfully");
      router.push("/custom-forms");
    } catch {
      customToast.error("Failed to create custom form field");
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
              You don&apos;t have permission to create custom form fields.
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
        Back to Custom Forms
      </Button>
      <h1 className="text-3xl font-bold">Create Custom Field</h1>
      <p className="text-gray-500 mt-2">
        Add a new custom field to an entity form
      </p>
      <div className="mt-6 max-w-4xl">
        <CustomFormFieldForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
