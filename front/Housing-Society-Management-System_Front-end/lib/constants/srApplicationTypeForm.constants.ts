// src/lib/constants/srApplicationTypeForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { SrApplicationTypeFormData } from "@/lib/schemas/srApplicationType.schema";

export const srApplicationTypeFormFields: FieldConfig<SrApplicationTypeFormData>[] =
  [
    {
      name: "applicationName",
      label: "Application Name",
      type: "text",
      required: true,
      placeholder: "Enter application type name",
      description: "Unique name for the application type (2-100 characters)",
    },
    {
      name: "applicationDesc",
      label: "Description",
      type: "textarea",
      required: false,
      placeholder: "Enter application type description",
      description: "Optional description (max 500 characters)",
      rows: 3,
    },
    {
      name: "applicationFee",
      label: "Application Fee",
      type: "number",
      required: true,
      placeholder: "Enter application fee",
      description: "Fee amount for this application type",
      min: 0,
      step: 0.01,
      prefix: "Rs.",
    },
  ];

export const updateSrApplicationTypeFormFields: FieldConfig<any>[] = [
  {
    name: "applicationName",
    label: "Application Name",
    type: "text",
    required: false,
    placeholder: "Enter application type name",
    description: "Unique name for the application type (2-100 characters)",
  },
  {
    name: "applicationDesc",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter application type description",
    description: "Optional description (max 500 characters)",
    rows: 3,
  },
  {
    name: "applicationFee",
    label: "Application Fee",
    type: "number",
    required: false,
    placeholder: "Enter application fee",
    description: "Fee amount for this application type",
    min: 0,
    step: 0.01,
    prefix: "Rs.",
  },
];
