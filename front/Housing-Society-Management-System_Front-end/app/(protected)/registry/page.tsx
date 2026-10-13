"use client";

import { RegistryList } from "@/components/registry/RegistryList";

export default function RegistryPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <RegistryList />
    </div>
  );
}
