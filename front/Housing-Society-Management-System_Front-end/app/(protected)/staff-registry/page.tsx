"use client";

import { StaffList } from "@/components/staff-registry/StaffList";

export default function StaffRegistryPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <StaffList />
    </div>
  );
}
