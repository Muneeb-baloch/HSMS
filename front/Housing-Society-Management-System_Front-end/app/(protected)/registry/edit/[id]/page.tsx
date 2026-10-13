"use client";

import { RegistryForm } from "@/components/registry/RegistryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useRegistry,
  useUpdateRegistry,
} from "@/lib/hooks/entities/useRegistry";
import { useAuth } from "@/lib/hooks/useAuth";
import { UpdateRegistryDto } from "@/lib/types/registry";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditRegistryPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateRegistry();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: registry, isLoading, error } = useRegistry(id);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: UpdateRegistryDto) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data });
      customToast.success("Registry updated successfully");
      router.push("/registry");
    } catch {
      customToast.error("Failed to update registry");
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
              You don&apos;t have permission to edit registries.
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

  if (error || !registry) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load registry.</CardDescription>
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
        Back to Registry
      </Button>
      <h1 className="text-3xl font-bold">Edit Registry</h1>
      <p className="text-gray-500 mt-2">Update registry document</p>
      <div className="mt-6 max-w-4xl">
        <RegistryForm
          mode="edit"
          defaultValues={registry}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
