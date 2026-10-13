"use client";

import { GatePassList } from "@/components/gate-pass/GatePassList";

export default function GatePassesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <GatePassList />
    </div>
  );
}
