"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ViewWorkflowPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Module Not Enabled</CardTitle>
          <CardDescription>
            AI & Automation is not enabled on this deployment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/workflows")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
