"use client";

import ImportWizard from "@/components/data-management/ImportWizard";

export default function ImportPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-bold tracking-tight">Import Data</h1>
      <ImportWizard />
    </div>
  );
}
