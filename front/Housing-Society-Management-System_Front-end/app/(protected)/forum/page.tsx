"use client";

import { ThreadList } from "@/components/forum/ThreadList";

export default function ForumPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <ThreadList />
    </div>
  );
}
