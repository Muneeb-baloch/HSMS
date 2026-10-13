"use client";

import { AlertHistory } from "@/components/emergency/AlertHistory";

export default function AlertHistoryPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <AlertHistory />
    </div>
  );
}
