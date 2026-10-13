// src/lib/constants/complaintCategoryForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { ComplaintCategoryFormData } from "@/lib/schemas/complaintCategory.schema";

export const complaintCategoryFormFields: FieldConfig<ComplaintCategoryFormData>[] =
  [
    {
      name: "categoryName",
      label: "Category Name",
      type: "text",
      required: true,
      placeholder:
        "Enter category name (e.g., Technical Issue, Billing Problem)",
    },
    {
      name: "categoryCode",
      label: "Category Code",
      type: "text",
      required: true,
      placeholder: "Enter category code (e.g., TECH, BILL, SERVICE)",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: false,
      placeholder: "Enter category description",
      rows: 3,
    },
    {
      name: "priorityLevel",
      label: "Priority Level",
      type: "number",
      required: true,
      placeholder: "Enter priority (1-10)",
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 5,
    },
    {
      name: "slaHours",
      label: "SLA Hours",
      type: "number",
      required: false,
      placeholder: "Enter SLA in hours",
      min: 1,
      defaultValue: 72,
    },
    {
      name: "isActive",
      label: "Active Status",
      type: "switch",
      required: false,
      defaultValue: true,
    },
  ];
