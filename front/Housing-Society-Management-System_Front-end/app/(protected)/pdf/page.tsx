"use client";

import { PDFGeneratorDashboard } from "@/components/pdf/PDFGeneratorDashboard";

export default function PDFPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <PDFGeneratorDashboard />
    </div>
  );
}
