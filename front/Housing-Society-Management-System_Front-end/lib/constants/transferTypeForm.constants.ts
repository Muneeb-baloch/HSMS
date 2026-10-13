// src/lib/constants/transferTypeForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { TransferTypeFormData } from "@/lib/schemas/transfer-type.schema";

export const transferTypeFormFields: FieldConfig<TransferTypeFormData>[] = [
  {
    name: "typeName",
    label: "Transfer Type Name",
    type: "text",
    required: true,
    placeholder: "e.g., Sale, Gift, Inheritance",
    description:
      "Enter a descriptive name for the transfer type (2-100 characters)",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Describe the purpose and details of this transfer type",
    description:
      "Optional: Provide details about when and how to use this transfer type (max 500 characters)",
    rows: 3,
  },
  {
    name: "transferFee",
    label: "Transfer Fee (Rs)",
    type: "number",
    required: true,
    placeholder: "0.00",
    description: "Enter the standard fee amount for this transfer type",
    min: 0,
    step: 0.01,
  },
];

export const updateTransferTypeFormFields: FieldConfig<any>[] = [
  {
    name: "typeName",
    label: "Transfer Type Name",
    type: "text",
    required: false,
  
    placeholder: "e.g., Sale, Gift, Inheritance",
    description:
      "Enter a descriptive name for the transfer type (2-100 characters)",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Describe the purpose and details of this transfer type",
    description:
      "Optional: Provide details about when and how to use this transfer type (max 500 characters)",
    rows: 3,
  },
  {
    name: "transferFee",
    label: "Transfer Fee (Rs)",
    type: "number",
    required: false,
    placeholder: "0.00",
    description: "Enter the standard fee amount for this transfer type",
    min: 0,
    step: 0.01,
  },
  {
    name: "isActive",
    label: "Active Status",

    type: "switch",
    required: false,
    description: "Enable or disable this transfer type for use",
  },
];
