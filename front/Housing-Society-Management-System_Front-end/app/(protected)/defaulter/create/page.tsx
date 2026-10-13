"use client";

import { DefaulterForm } from "@/components/defaulter/DefaulterForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useCreateDefaulter } from "@/lib/hooks/entities/useDefaulter";
import { useAuth } from "@/lib/hooks/useAuth";
import { CreateDefaulterDto } from "@/lib/types/defaulter";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";

export default function CreateDefaulterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateDefaulter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: CreateDefaulterDto) => {
    try {
      setIsSubmitting(true);
      await createMutation.mutateAsync(data);
      customToast.success("Defaulter record created successfully");
      router.push("/defaulter");
    } catch {
      customToast.error("Failed to create defaulter");
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
              You don&apos;t have permission to create defaulter records.
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
        Back to Defaulters
      </Button>
      <h1 className="text-3xl font-bold">Create Defaulter</h1>
      <p className="text-gray-500 mt-2">Add a new defaulter record</p>
      <div className="mt-6 max-w-4xl">
        <DefaulterForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
