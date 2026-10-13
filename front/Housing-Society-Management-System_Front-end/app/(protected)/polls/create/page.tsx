"use client";

import { PollForm } from "@/components/poll/PollForm";
import { useCreatePoll } from "@/lib/hooks/entities/usePoll";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function CreatePollPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createPoll = useCreatePoll();

  const canCreate =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR,
    ]);

  if (!canCreate) {
    return (
      <div className="flex flex-1 flex-col overflow-auto p-6">
        <p className="text-muted-foreground">
          You do not have permission to create polls.
        </p>
      </div>
    );
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    await createPoll.mutateAsync(data);
    router.push("/polls");
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Poll</h1>
        <p className="text-muted-foreground">
          Create a new poll for society members
        </p>
      </div>
      <PollForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/polls")}
        isLoading={createPoll.isPending}
      />
    </div>
  );
}
