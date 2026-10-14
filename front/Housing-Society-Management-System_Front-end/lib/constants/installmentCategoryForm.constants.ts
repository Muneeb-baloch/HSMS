// src/lib/constants/installmentCategoryForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import {
  INSTALLMENT_CATEGORY_KIND_LABELS,
  InstallmentCategoryKind,
} from "@/lib/types/installmentCategory";
import { InstallmentCategoryFormData } from "@/lib/schemas/installmentCategory.schema";

export const installmentCategoryFormFields: FieldConfig<InstallmentCategoryFormData>[] =
  [
    {
      name: "instCatName",
      label: "Category Name",
      type: "text",
      required: true,
      placeholder:
        "Enter category name (e.g., Down Payment, Monthly Installment)",
    },
    {
      name: "instCatDescription",
      label: "Description",
      type: "textarea",
      required: false,
      placeholder: "Enter category description",
      rows: 3,
    },
    {
      name: "kind",
      label: "Kind",
      type: "select",
      required: true,
      options: Object.values(InstallmentCategoryKind).map((kind) => ({
        label: INSTALLMENT_CATEGORY_KIND_LABELS[kind],
        value: kind,
      })),
      placeholder: "Select kind",
      description:
        "down_payment/installment count toward the plot price; everything else is a real charge tracked separately and excluded from it.",
    },
    {
      name: "sequenceOrder",
      label: "Sequence Order",
      type: "number",
      required: true,
      placeholder: "Enter sequence order",
      min: 1,
      step: 1,
    },
    {
      name: "isRefundable",
      label: "Is Refundable",
      type: "switch",
      required: false,
      defaultValue: false,
    },
    {
      name: "isMandatory",
      label: "Is Mandatory",
      type: "switch",
      required: false,
      defaultValue: true,
    },
    {
      name: "isActive",
      label: "Active Status",
      type: "switch",
      required: false,
      defaultValue: true,
    },
  ];
