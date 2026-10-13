"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkflow } from "@/lib/hooks/entities/useWorkflow";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const stepTypeColors: Record<string, string> = {
  approval: "bg-blue-100 text-blue-800",
  notification: "bg-green-100 text-green-800",
  "field-update": "bg-yellow-100 text-yellow-800",
  "status-change": "bg-purple-100 text-purple-800",
  delay: "bg-gray-100 text-gray-800",
  condition: "bg-orange-100 text-orange-800",
  escalation: "bg-red-100 text-red-800",
  webhook: "bg-indigo-100 text-indigo-800",
  "ai-action": "bg-pink-100 text-pink-800",
};

export default function ViewWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: workflow, isLoading, error } = useWorkflow(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }

            {workflow.triggerConditions &&
              Object.keys(workflow.triggerConditions).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Trigger Conditions
                  </p>
                  <pre className="bg-gray-50 p-3 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(workflow.triggerConditions, null, 2)}
                  </pre>
                </div>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Steps ({workflow.steps?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workflow.steps && workflow.steps.length > 0 ? (
              <div className="space-y-4">
                {workflow.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={
                            stepTypeColors[step.stepType] ||
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {step.stepType}
                        </Badge>
                        {step.nextStepOnSuccess !== undefined && (
                          <span className="text-xs text-green-600">
                            Success → Step {step.nextStepOnSuccess}
                          </span>
                        )}
                        {step.nextStepOnFailure !== undefined && (
                          <span className="text-xs text-red-600">
                            Failure → Step {step.nextStepOnFailure}
                          </span>
                        )}
                        {step.nextStepOnTimeout !== undefined && (
                          <span className="text-xs text-yellow-600">
                            Timeout → Step {step.nextStepOnTimeout}
                          </span>
                        )}
                      </div>
                      {step.config &&
                        Object.keys(step.config).length > 0 && (
                          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(step.config, null, 2)}
                          </pre>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No steps defined.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
