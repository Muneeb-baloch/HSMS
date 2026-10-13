// src/lib/constants/plotTypeForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { PlotTypeFormData } from "../schemas/plottype.schema";

export const plotTypeFormFields: FieldConfig<PlotTypeFormData>[] = [
  {
    name: "plotTypeName",
    label: "Plot Type Name",
    type: "text",
    required: true,
    placeholder: "Enter plot type name (e.g., Residential, Commercial)",
  },
];
