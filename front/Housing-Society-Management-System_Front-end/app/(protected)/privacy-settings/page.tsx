"use client";

import { PrivacyDashboard } from "@/components/privacy/PrivacyDashboard";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Privacy Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your privacy preferences and data sharing options
        </p>
      </div>
      <PrivacyDashboard />
    </div>
  );
}
