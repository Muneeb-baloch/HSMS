"use client";

import { AIConversationList } from "@/components/ai/AIConversationList";

export default function AIPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <AIConversationList />
    </div>
  );
}
