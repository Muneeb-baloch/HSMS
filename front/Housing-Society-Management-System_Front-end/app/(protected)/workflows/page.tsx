"use client";

import { WorkflowList } from "@/components/workflow/WorkflowList";

export default function WorkflowsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <WorkflowList />
    </div>
  );
}
