"use client";

import { ParkingDashboard } from "@/components/parking/ParkingDashboard";

export default function ParkingPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <ParkingDashboard />
    </div>
  );
}
