"use client";

import {
  EntityForm,
  FieldConfig,
} from "@/components/shared/EntityForm/EntityForm";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";

const maintenanceSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  priority: z.string().min(1, "Priority is required"),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

const maintenanceFormFields: FieldConfig<MaintenanceFormData>[] = [
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: [
      { label: "Plumbing", value: "plumbing" },
      { label: "Electrical", value: "electrical" },
      { label: "Carpentry", value: "carpentry" },
      { label: "Painting", value: "painting" },
      { label: "Pest Control", value: "pest_control" },
      { label: "HVAC", value: "hvac" },
      { label: "Elevator", value: "elevator" },
      { label: "Generator", value: "generator" },
      { label: "Water Supply", value: "water_supply" },
      { label: "Sewerage", value: "sewerage" },
      { label: "Road Repair", value: "road_repair" },
      { label: "Landscaping", value: "landscaping" },
      { label: "Security Equipment", value: "security_equipment" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
    placeholder: "Brief title for the issue",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: true,
    placeholder: "Describe the issue in detail...",
    rows: 5,
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    required: true,
    placeholder: "e.g., Block A, House 12, Kitchen",
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    required: true,
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Urgent", value: "urgent" },
    ],
  },
];

interface MaintenanceFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<MaintenanceFormData>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MaintenanceForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: MaintenanceFormProps) {
  const handleSubmit = async (data: MaintenanceFormData) => {
    await onSubmit(data);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <EntityForm
          schema={maintenanceSchema}
          fields={maintenanceFormFields}
          defaultValues={defaultValues as any}
          onSubmit={handleSubmit as any}
          onCancel={onCancel}
          submitLabel={
            mode === "create" ? "Submit Request" : "Update Request"
          }
          cancelLabel="Cancel"
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
