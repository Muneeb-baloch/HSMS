"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowStep,
} from "@/lib/types/workflow";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { useCallback, useState } from "react";

const TRIGGER_TYPES = [
  { label: "Entity Create", value: "entity-create" },
  { label: "Status Change", value: "status-change" },
  { label: "Field Update", value: "field-update" },
  { label: "Time Based", value: "time-based" },
  { label: "Manual", value: "manual" },
];

const STEP_TYPES = [
  { label: "Approval", value: "approval" },
  { label: "Notification", value: "notification" },
  { label: "Field Update", value: "field-update" },
  { label: "Status Change", value: "status-change" },
  { label: "Delay", value: "delay" },
  { label: "Condition", value: "condition" },
  { label: "Escalation", value: "escalation" },
  { label: "Webhook", value: "webhook" },
  { label: "AI Action", value: "ai-action" },
];

interface WorkflowFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateWorkflowDto>;
  onSubmit: (data: CreateWorkflowDto | UpdateWorkflowDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WorkflowForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: WorkflowFormProps) {
  const [name, setName] = useState(defaultValues?.name || "");
  const [description, setDescription] = useState(
    defaultValues?.description || ""
  );
  const [triggerType, setTriggerType] = useState(
    defaultValues?.triggerType || ""
  );
  const [triggerEntity, setTriggerEntity] = useState(
    defaultValues?.triggerEntity || ""
  );
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true);
  const [steps, setSteps] = useState<WorkflowStep[]>(
    defaultValues?.steps || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!triggerType) newErrors.triggerType = "Trigger type is required";
    if (!triggerEntity.trim())
      newErrors.triggerEntity = "Trigger entity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, triggerType, triggerEntity]);

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        stepType: "approval",
        config: {},
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((step, i) => ({ ...step, stepNumber: i + 1 }));
    });
  };

  const handleStepTypeChange = (index: number, stepType: string) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, stepType: stepType as WorkflowStep["stepType"] } : step
      )
    );
  };

  const handleStepConfigChange = (index: number, configStr: string) => {
    try {
      const config = JSON.parse(configStr);
      setSteps((prev) =>
        prev.map((step, i) => (i === index ? { ...step, config } : step))
      );
    } catch {
      // Allow invalid JSON during typing
    }
  };

  const handleStepNextChange = (
    index: number,
    field: "nextStepOnSuccess" | "nextStepOnFailure" | "nextStepOnTimeout",
    value: string
  ) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index
          ? {
              ...step,
              [field]: value ? parseInt(value, 10) : undefined,
            }
          : step
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateWorkflowDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      societyId: defaultValues?.societyId || "",
      triggerType,
      triggerEntity: triggerEntity.trim(),
      steps,
      isActive,
    };

    await onSubmit(payload);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workflow name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggerType">
                Trigger Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={triggerType}
                onValueChange={setTriggerType}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.triggerType && (
                <p className="text-sm text-red-500">{errors.triggerType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggerEntity">
                Trigger Entity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="triggerEntity"
                value={triggerEntity}
                onChange={(e) => setTriggerEntity(e.target.value)}
                placeholder="e.g. complaint, application, member"
                disabled={isLoading}
              />
              {errors.triggerEntity && (
                <p className="text-sm text-red-500">{errors.triggerEntity}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isLoading}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this workflow..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Steps Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Steps ({steps.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStep}
                disabled={isLoading}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Step
              </Button>
            </div>

            {steps.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
                No steps added yet. Click &quot;Add Step&quot; to begin.
              </p>
            )}

            {steps.map((step, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-4 bg-gray-50/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-sm">
                      Step {step.stepNumber}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStep(index)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Step Type</Label>
                    <Select
                      value={step.stepType}
                      onValueChange={(val) => handleStepTypeChange(index, val)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select step type" />
                      </SelectTrigger>
                      <SelectContent>
                        {STEP_TYPES.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">On Success</Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Step #"
                        value={step.nextStepOnSuccess ?? ""}
                        onChange={(e) =>
                          handleStepNextChange(
                            index,
                            "nextStepOnSuccess",
                            e.target.value
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">On Failure</Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Step #"
                        value={step.nextStepOnFailure ?? ""}
                        onChange={(e) =>
                          handleStepNextChange(
                            index,
                            "nextStepOnFailure",
                            e.target.value
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">On Timeout</Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Step #"
                        value={step.nextStepOnTimeout ?? ""}
                        onChange={(e) =>
                          handleStepNextChange(
                            index,
                            "nextStepOnTimeout",
                            e.target.value
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Configuration (JSON)</Label>
                  <Textarea
                    rows={4}
                    defaultValue={JSON.stringify(step.config, null, 2)}
                    onChange={(e) =>
                      handleStepConfigChange(index, e.target.value)
                    }
                    placeholder='{ "key": "value" }'
                    className="font-mono text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Workflow" : "Update Workflow"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
