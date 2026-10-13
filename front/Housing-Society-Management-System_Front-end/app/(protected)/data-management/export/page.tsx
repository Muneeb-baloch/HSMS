"use client";

import ExportPanel from "@/components/data-management/ExportPanel";

export default function ExportPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-bold tracking-tight">Export Data</h1>
      <ExportPanel />
    </div>
  );
}
