"use client";

import {
  EntityForm,
  FieldConfig,
} from "@/components/shared/EntityForm/EntityForm";
import { Card, CardContent } from "@/components/ui/card";
import { billTypeFormFields } from "@/lib/constants/billTypeForm.constants";
import { billTypeSchema } from "@/lib/schemas/billType.schema";
import {
  CreateBillTypeDto,
  UpdateBillTypeDto,
  BillType,
} from "@/lib/types/billType";

type BillTypeFormPropsBase = {
  onCancel: () => void;
  isLoading?: boolean;
};

export type BillTypeFormProps =
  | (BillTypeFormPropsBase & {
      mode: "create";
      defaultValues?: Partial<BillType>;
      onSubmit: (data: CreateBillTypeDto) => Promise<void>;
    })
  | (BillTypeFormPropsBase & {
      mode: "edit";
      defaultValues?: Partial<BillType>;
      onSubmit: (data: UpdateBillTypeDto) => Promise<void>;
    });

function toFormValues(billType?: Partial<BillType> | null): Record<string, unknown> {
  if (!billType) return {};
  return {
    billTypeName: billType.billTypeName ?? "",
    billTypeCategory: billType.billTypeCategory ?? "Fee",
    defaultAmount: billType.defaultAmount ?? 0,
    calculationMethod: billType.calculationMethod ?? undefined,
    isRecurring: billType.isRecurring ?? false,
    isActive: billType.isActive ?? true,
    description: billType.description ?? "",
  };
}

export function BillTypeForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: BillTypeFormProps) {
  const values = toFormValues(defaultValues as BillType);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const payload: CreateBillTypeDto | UpdateBillTypeDto = {
      billTypeName: String(data.billTypeName || "").trim(),
      billTypeCategory: data.billTypeCategory as CreateBillTypeDto["billTypeCategory"],
      defaultAmount: data.defaultAmount ? Number(data.defaultAmount) : undefined,
      calculationMethod: (data.calculationMethod as CreateBillTypeDto["calculationMethod"]) || undefined,
      isRecurring: Boolean(data.isRecurring),
      isActive: Boolean(data.isActive),
      description: (data.description as string) || undefined,
    };
    if (mode === "edit") {
      const { billTypeName, billTypeCategory, ...rest } = payload;
      await onSubmit({
        ...rest,
        billTypeName,
        billTypeCategory,
      } as UpdateBillTypeDto);
    } else {
      await onSubmit(payload as CreateBillTypeDto);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <EntityForm
          schema={billTypeSchema}
          fields={billTypeFormFields as FieldConfig<Record<string, unknown>>[]}
          defaultValues={values}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel={mode === "create" ? "Create Bill Type" : "Update Bill Type"}
          cancelLabel="Cancel"
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
