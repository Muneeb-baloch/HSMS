"use client";

import {
  EntityForm,
  FieldConfig,
} from "@/components/shared/EntityForm/EntityForm";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";

const staffSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  cnic: z
    .string()
    .min(13, "CNIC must be 13 digits")
    .max(13, "CNIC must be 13 digits")
    .regex(/^\d{13}$/, "CNIC must be exactly 13 digits"),
  phone: z.string().min(1, "Phone number is required"),
  gender: z.string().min(1, "Gender is required"),
  staffType: z.string().min(1, "Staff type is required"),
  address: z.string().optional(),
  skills: z.string().optional(),
  languages: z.string().optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

const staffFormFields: FieldConfig<StaffFormData>[] = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter full name",
  },
  {
    name: "cnic",
    label: "CNIC",
    type: "text",
    required: true,
    placeholder: "Enter 13-digit CNIC number",
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
    required: true,
    placeholder: "Enter phone number",
  },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    required: true,
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "staffType",
    label: "Staff Type",
    type: "select",
    required: true,
    options: [
      { label: "Maid", value: "maid" },
      { label: "Driver", value: "driver" },
      { label: "Cook", value: "cook" },
      { label: "Gardener", value: "gardener" },
      { label: "Guard", value: "guard" },
      { label: "Sweeper", value: "sweeper" },
      { label: "Nanny", value: "nanny" },
      { label: "Tutor", value: "tutor" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "address",
    label: "Address",
    type: "textarea",
    required: false,
    placeholder: "Enter address",
  },
  {
    name: "skills",
    label: "Skills (comma-separated)",
    type: "text",
    required: false,
    placeholder: "e.g., cooking, cleaning, driving",
  },
  {
    name: "languages",
    label: "Languages (comma-separated)",
    type: "text",
    required: false,
    placeholder: "e.g., Urdu, English, Punjabi",
  },
];

interface StaffFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<StaffFormData>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StaffForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: StaffFormProps) {
  const handleSubmit = async (data: StaffFormData) => {
    const payload: Record<string, unknown> = {
      ...data,
      skills: data.skills
        ? data.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      languages: data.languages
        ? data.languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : [],
    };
    await onSubmit(payload);
  };

  const formDefaults = defaultValues
    ? {
        ...defaultValues,
        skills: Array.isArray(defaultValues.skills)
          ? (defaultValues.skills as unknown as string[]).join(", ")
          : defaultValues.skills || "",
        languages: Array.isArray(defaultValues.languages)
          ? (defaultValues.languages as unknown as string[]).join(", ")
          : defaultValues.languages || "",
      }
    : undefined;

  return (
    <Card>
      <CardContent className="pt-6">
        <EntityForm
          schema={staffSchema}
          fields={staffFormFields}
          defaultValues={formDefaults as any}
          onSubmit={handleSubmit as any}
          onCancel={onCancel}
          submitLabel={mode === "create" ? "Register Staff" : "Update Staff"}
          cancelLabel="Cancel"
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
