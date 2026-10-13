"use client";

import { ComplaintList } from "@/components/complaint/ComplaintList";

export default function ComplaintsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <ComplaintList />
    </div>
  );
}
