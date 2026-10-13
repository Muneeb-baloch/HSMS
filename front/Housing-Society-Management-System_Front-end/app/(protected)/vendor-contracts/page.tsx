"use client";

import { ContractList } from "@/components/vendor/ContractList";

export default function VendorContractsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <ContractList />
    </div>
  );
}
