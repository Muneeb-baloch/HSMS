"use client";

import { GatePassForm } from "@/components/gate-pass/GatePassForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useCreateGatePass } from "@/lib/hooks/entities/useGatePass";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateGatePassPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateGatePass();

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
      router.push("/gate-passes");
    } catch {
      customToast.error("Failed to create gate pass");
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
              You don&apos;t have permission to request gate passes.
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
        Back to Gate Passes
      </Button>
      <h1 className="text-3xl font-bold">Request Gate Pass</h1>
      <p className="text-gray-500 mt-2">
        Submit a new gate pass request for material or vehicle entry/exit
      </p>
      <div className="mt-6 max-w-4xl">
        <GatePassForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
