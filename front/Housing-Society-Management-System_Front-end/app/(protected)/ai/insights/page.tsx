"use client";

import { AIInsightsDashboard } from "@/components/ai/AIInsightsDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AIInsightsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <Button
        variant="ghost"
        className="mb-4 w-fit"
        onClick={() => router.push("/ai")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI
      </Button>

      <AIInsightsDashboard />
    </div>
  );
}
