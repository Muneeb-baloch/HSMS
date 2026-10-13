import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { PlotBlockFormData } from "@/lib/schemas/plotblock.schema";

export const plotBlockFormFields: FieldConfig<PlotBlockFormData>[] = [
  {
    name: "projectId",
    label: "Project",
    type: "relationship",
    required: false,
    relationship: {
      endpoint: "/projects",
      labelField: "projName",
      valueField: "_id",
      searchable: true,
    },
  },
  {
    name: "plotBlockName",
    label: "Plot Block Name",
    type: "text",
    required: true,
    placeholder: "Enter plot block name",
  },
  {
    name: "plotBlockDesc",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter plot block description (optional)",
  },
  {
    name: "blockTotalArea",
    label: "Total Area",
    type: "number",
    required: false,
    placeholder: "Enter total area",
    // min: 0,
    // step: 0.01,
  },
  {
    name: "blockAreaUnit",
    label: "Area Unit",
    type: "select",
    required: false,
    options: [
      { label: "Acres", value: "acres" },
      { label: "Hectares", value: "hectares" },
      { label: "Square Feet", value: "sqft" },
      { label: "Square Meters", value: "sqm" },
      { label: "Square Kilometers", value: "km²" },
      { label: "Marla", value: "marla" },
      { label: "Kanal", value: "kanal" },
    ],
    placeholder: "Select area unit",
    description: "Total area cannot exceed the project's total area",
  },
];
