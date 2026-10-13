"use client";

import { PassForm } from "@/components/parking/PassForm";

export default function IssuePassPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <PassForm />
    </div>
  );
}
