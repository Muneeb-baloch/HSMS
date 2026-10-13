// lib/types/workflow.ts

export interface WorkflowStep {
  stepNumber: number;
  stepType:
    | "approval"
    | "notification"
    | "field-update"
    | "status-change"
    | "delay"
    | "condition"
    | "escalation"
    | "webhook"
    | "ai-action";
  config: Record<string, unknown>;
  nextStepOnSuccess?: number;
  nextStepOnFailure?: number;
  nextStepOnTimeout?: number;
}

export interface Workflow {
  _id: string;
  name: string;
  description?: string;
  societyId: string;
  triggerType:
    | "entity-create"
    | "status-change"
    | "field-update"
    | "time-based"
    | "manual";
  triggerEntity: string;
  triggerConditions?: Record<string, unknown>;
  steps: WorkflowStep[];
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepLog {
  stepNumber: number;
  stepType: string;
  status: "pending" | "completed" | "failed" | "skipped" | "timed-out";
  executedAt?: string;
  executedBy?: string;
  result?: Record<string, unknown>;
  notes?: string;
}

export interface WorkflowInstance {
  _id: string;
  workflowId: string | Workflow;
  entityType: string;
  entityId: string;
  societyId: string;
  currentStepNumber: number;
  status: "pending" | "in-progress" | "completed" | "failed" | "cancelled";
  stepLogs: WorkflowStepLog[];
  startedAt?: string;
  completedAt?: string;
  initiatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  societyId: string;
  triggerType: string;
  triggerEntity: string;
  triggerConditions?: Record<string, unknown>;
  steps: WorkflowStep[];
  isActive?: boolean;
}

export interface UpdateWorkflowDto extends Partial<CreateWorkflowDto> {}

export interface WorkflowQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  societyId?: string;
  triggerEntity?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
