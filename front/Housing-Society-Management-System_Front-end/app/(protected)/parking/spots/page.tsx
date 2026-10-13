"use client";

import { SpotList } from "@/components/parking/SpotList";

export default function ParkingSpotsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <SpotList />
    </div>
  );
}
