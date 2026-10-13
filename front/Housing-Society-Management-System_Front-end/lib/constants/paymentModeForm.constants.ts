// src/lib/constants/paymentModeForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { PaymentModeFormData } from "@/lib/schemas/paymentMode.schema";

export const paymentModeFormFields: FieldConfig<PaymentModeFormData>[] = [
  {
    name: "paymentModeName",
    label: "Payment Mode Name",
    type: "text",
    required: true,
    placeholder: "e.g. Cash, Bank Transfer, Online Payment",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter payment mode description",
    rows: 3,
  },
  {
    name: "isActive",
    label: "Active Status",
    type: "switch",
    required: false,
    defaultValue: true,
  },
];
