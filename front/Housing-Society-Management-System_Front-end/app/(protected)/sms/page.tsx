"use client";

import { SMSDashboard } from "@/components/sms/SMSDashboard";

export default function SMSPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <SMSDashboard />
    </div>
  );
}
