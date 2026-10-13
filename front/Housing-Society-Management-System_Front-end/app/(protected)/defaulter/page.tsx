"use client";

import { DefaulterList } from "@/components/defaulter/DefaulterList";

export default function DefaulterPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <DefaulterList />
    </div>
  );
}
