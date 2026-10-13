"use client";

import { PrivacyAccessLog } from "@/components/privacy/PrivacyAccessLog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyAccessLogPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <Button
        variant="ghost"
        className="mb-6 w-fit"
        onClick={() => router.push("/privacy")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Privacy Settings
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Privacy Access Log</h1>
        <p className="text-muted-foreground mt-1">
          View who has accessed your personal data and when
        </p>
      </div>

      <PrivacyAccessLog />
    </div>
  );
}
