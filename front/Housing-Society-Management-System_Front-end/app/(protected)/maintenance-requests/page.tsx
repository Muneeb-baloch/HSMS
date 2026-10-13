"use client";

import { MaintenanceList } from "@/components/maintenance/MaintenanceList";

export default function MaintenanceRequestsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <MaintenanceList />
    </div>
  );
}
