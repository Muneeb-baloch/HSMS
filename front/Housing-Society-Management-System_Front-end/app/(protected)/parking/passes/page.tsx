"use client";

import { PassList } from "@/components/parking/PassList";

export default function ParkingPassesPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <PassList />
    </div>
  );
}
