// src/lib/constants/plotcategoryForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { PlotCategoryFormData } from "@/lib/schemas/plotcategory.schema";

export const plotCategoryFormFields: FieldConfig<PlotCategoryFormData>[] = [
  {
    name: "categoryName",
    label: "Category Name",
    type: "text",
    required: true,
    placeholder: "Enter category name",
  },
  {
    name: "categoryDesc",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter category description (optional)",
    rows: 3,
  },
  {
    name: "isActive",
    label: "Active Status",
    type: "switch",
    required: false,
    defaultValue: true,
  },
  {
    name: "surchargeType",
    label: "Surcharge Type",
    type: "select",
    required: false,
    options: [
      { label: "No Surcharge", value: "none" },
      { label: "Percentage (%)", value: "percentage" },
      { label: "Fixed Amount", value: "fixed" },
    ],
    defaultValue: "none",
  },
  {
    name: "surchargePercentage",
    label: "Surcharge Percentage",
    type: "number",
    required: false,
    placeholder: "Enter percentage (0-100)",
    min: 0,
    max: 100,
    step: 0.1,
    showWhen: (values) => values.surchargeType === "percentage",
  },
  {
    name: "surchargeFixedAmount",
    label: "Surcharge Fixed Amount",
    type: "number",
    required: false,
    placeholder: "Enter fixed amount",
    min: 0,
    step: 0.01,
    showWhen: (values) => values.surchargeType === "fixed",
  },
];
