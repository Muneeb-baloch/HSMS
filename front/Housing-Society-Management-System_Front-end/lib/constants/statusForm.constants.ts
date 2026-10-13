// src/lib/constants/state.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { StatusFormData } from "../schemas/status.schema";

export const statusFormFields: FieldConfig<StatusFormData>[] = [
  {
    name: "statusName",
    label: "Status Name",
    type: "text",
    required: true,
    placeholder: "Enter status name",
  },
  {
    name: "statusDescription",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter status description (optional)",
  },
];
