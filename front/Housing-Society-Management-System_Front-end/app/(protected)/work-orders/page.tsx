"use client";

import { WorkOrderList } from "@/components/vendor/WorkOrderList";

export default function WorkOrdersPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <WorkOrderList />
    </div>
  );
}
