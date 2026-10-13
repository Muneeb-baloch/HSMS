"use client";

import { useParams } from "next/navigation";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AIChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <Button
        variant="ghost"
        className="mb-4 w-fit"
        onClick={() => router.push("/ai")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Conversations
      </Button>

      <div className="flex-1 min-h-0">
        <AIChatPanel conversationId={conversationId} />
      </div>
    </div>
  );
}
