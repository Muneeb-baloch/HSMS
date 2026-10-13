"use client";

import { ListingForm } from "@/components/marketplace/ListingForm";

export default function CreateListingPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <ListingForm />
    </div>
  );
}
