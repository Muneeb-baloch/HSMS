"use client";

import { ThreadForm } from "@/components/forum/ThreadForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useCreateThread } from "@/lib/hooks/entities/useForum";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateThreadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateThread();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync(data);
      router.push("/forum");
    } catch {
      customToast.error("Failed to create thread");
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
              You don&apos;t have permission to create threads.
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
        Back to Forum
      </Button>
      <h1 className="text-3xl font-bold">Create Thread</h1>
      <p className="text-gray-500 mt-2">Start a new discussion</p>
      <div className="mt-6 max-w-4xl">
        <ThreadForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
