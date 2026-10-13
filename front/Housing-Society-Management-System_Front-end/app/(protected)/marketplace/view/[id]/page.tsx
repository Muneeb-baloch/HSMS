"use client";

import { ListingView } from "@/components/marketplace/ListingView";
import { useParams } from "next/navigation";

export default function ViewListingPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <ListingView id={id} />
    </div>
  );
}
