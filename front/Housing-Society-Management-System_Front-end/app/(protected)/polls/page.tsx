"use client";

import { PollList } from "@/components/poll/PollList";

export default function PollsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <PollList />
    </div>
  );
}
