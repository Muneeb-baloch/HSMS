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
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useCustomForm,
  useUpdateCustomForm,
} from "@/lib/hooks/entities/useCustomForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { UpdateCustomFormFieldDto } from "@/lib/types/custom-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditCustomFormPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateCustomForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: field, isLoading, error } = useCustomForm(id);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: UpdateCustomFormFieldDto) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data });
      customToast.success("Custom form field updated successfully");
      router.push("/custom-forms");
    } catch {
      customToast.error("Failed to update custom form field");
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
              You don&apos;t have permission to edit custom form fields.
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

  if (error || !field) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              Failed to load custom form field.
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

  const defaultValues = {
    entityType: field.entityType,
    fieldName: field.fieldName,
    fieldLabel: field.fieldLabel,
    fieldType: field.fieldType,
    options: field.options || [],
    isRequired: field.isRequired,
    defaultValue: field.defaultValue,
    validationRules: field.validationRules || {},
    placeholder: field.placeholder || "",
    helpText: field.helpText || "",
    order: field.order,
    section: field.section || "",
    width: field.width || "full",
    societyId: field.societyId,
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Custom Forms
      </Button>
      <h1 className="text-3xl font-bold">Edit Custom Field</h1>
      <p className="text-gray-500 mt-2">Update custom form field settings</p>
      <div className="mt-6 max-w-4xl">
        <CustomFormFieldForm
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
