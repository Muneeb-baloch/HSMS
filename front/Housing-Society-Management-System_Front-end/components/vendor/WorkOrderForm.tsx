"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CreateWorkOrderDto, UpdateWorkOrderDto } from "@/lib/types/vendor";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
  { label: "Plumbing", value: "plumbing" },
  { label: "Electrical", value: "electrical" },
  { label: "Construction", value: "construction" },
  { label: "Painting", value: "painting" },
  { label: "Landscaping", value: "landscaping" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Security", value: "security" },
  { label: "HVAC", value: "hvac" },
  { label: "General Maintenance", value: "general_maintenance" },
  { label: "Other", value: "other" },
];

interface WorkOrderFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateWorkOrderDto & { _id?: string }>;
  onSubmit: (data: CreateWorkOrderDto | UpdateWorkOrderDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WorkOrderForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: WorkOrderFormProps) {
  const [formData, setFormData] = useState({
    title: defaultValues?.title || "",
    description: defaultValues?.description || "",
    category: defaultValues?.category || "",
    estimatedBudget: defaultValues?.estimatedBudget?.toString() || "",
    deadline: defaultValues?.deadline
      ? new Date(defaultValues.deadline).toISOString().split("T")[0]
      : "",
    scope: defaultValues?.scope || "",
    societyId: defaultValues?.societyId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (mode === "create" && !formData.societyId.trim())
      newErrors.societyId = "Society ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateWorkOrderDto | UpdateWorkOrderDto = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      ...(formData.estimatedBudget && {
        estimatedBudget: parseFloat(formData.estimatedBudget),
      }),
      ...(formData.deadline && { deadline: formData.deadline }),
      ...(formData.scope && { scope: formData.scope }),
      ...(mode === "create" && { societyId: formData.societyId }),
    };

    await onSubmit(payload);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter work order title"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedBudget">Estimated Budget ($)</Label>
              <Input
                id="estimatedBudget"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedBudget}
                onChange={(e) =>
                  handleChange("estimatedBudget", e.target.value)
                }
                placeholder="Enter estimated budget"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange("deadline", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="societyId">
                  Society ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="societyId"
                  value={formData.societyId}
                  onChange={(e) => handleChange("societyId", e.target.value)}
                  placeholder="Enter society ID"
                  disabled={isLoading}
                />
                {errors.societyId && (
                  <p className="text-sm text-red-500">{errors.societyId}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the work order in detail"
              rows={4}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Scope</Label>
            <Textarea
              id="scope"
              value={formData.scope}
              onChange={(e) => handleChange("scope", e.target.value)}
              placeholder="Define the scope of work"
              rows={3}
              disabled={isLoading}
            />
          </div>

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
              {mode === "create" ? "Create Work Order" : "Update Work Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
