"use client";

import { GatePassView } from "@/components/gate-pass/GatePassView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ViewGatePassPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gate Passes
      </Button>
      <GatePassView passId={id} />
    </div>
  );
}
