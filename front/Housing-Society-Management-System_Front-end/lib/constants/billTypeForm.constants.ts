import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { BillTypeFormData } from "@/lib/schemas/billType.schema";

const CATEGORIES = [
  { label: "Utility", value: "Utility" },
  { label: "Administrative", value: "Administrative" },
  { label: "Penalty", value: "Penalty" },
  { label: "Tax", value: "Tax" },
  { label: "Fee", value: "Fee" },
  { label: "Other", value: "Other" },
];

const CALCULATION_TYPES = [
  { label: "Fixed", value: "FIXED" },
  { label: "Per Unit", value: "PER_UNIT" },
  { label: "Percentage", value: "PERCENTAGE" },
  { label: "Tiered", value: "TIERED" },
];

export const billTypeFormFields: FieldConfig<BillTypeFormData>[] = [
  {
    name: "billTypeName",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Enter bill type name",
  },
  {
    name: "billTypeCategory",
    label: "Category",
    type: "select",
    required: true,
    options: CATEGORIES,
    placeholder: "Select category",
  },
  {
    name: "defaultAmount",
    label: "Amount",
    type: "number",
    min: 0,
    step: 0.01,
    placeholder: "0",
  },
  {
    name: "calculationMethod",
    label: "Calculation Type",
    type: "select",
    options: CALCULATION_TYPES,
    placeholder: "Select calculation type",
  },
  {
    name: "isRecurring",
    label: "Recurring",
    type: "switch",
    defaultValue: false,
  },
  {
    name: "isActive",
    label: "Status",
    type: "switch",
    defaultValue: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    rows: 3,
    placeholder: "Enter description...",
  },
];
