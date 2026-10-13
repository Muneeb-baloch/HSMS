"use client";

import { ListingGrid } from "@/components/marketplace/ListingGrid";

export default function MarketplacePage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <ListingGrid />
    </div>
  );
}
