"use client";

import { MeetingList } from "@/components/meeting/MeetingList";

export default function MeetingsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <MeetingList />
    </div>
  );
}
