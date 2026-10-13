"use client";

import { VendorList } from "@/components/vendor/VendorList";

export default function VendorsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <VendorList />
    </div>
  );
}
