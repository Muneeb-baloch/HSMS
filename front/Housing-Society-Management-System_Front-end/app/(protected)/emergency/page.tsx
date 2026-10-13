"use client";

import { EmergencyDashboard } from "@/components/emergency/EmergencyDashboard";

export default function EmergencyPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <EmergencyDashboard />
    </div>
  );
}
