"use client";

import {
  EntityForm,
  FieldConfig,
} from "@/components/shared/EntityForm/EntityForm";
import { Card, CardContent } from "@/components/ui/card";
import { billInfoFormFields } from "@/lib/constants/billInfoForm.constants";
import { billInfoSchema } from "@/lib/schemas/billInfo.schema";
import {
  CreateBillInfoDto,
  UpdateBillInfoDto,
  BillInfo,
} from "@/lib/types/billInfo";

type BillFormPropsBase = {
  onCancel: () => void;
  isLoading?: boolean;
};

export type BillFormProps =
  | (BillFormPropsBase & {
      mode: "create";
      defaultValues?: Partial<BillInfo>;
      onSubmit: (data: CreateBillInfoDto) => Promise<void>;
    })
  | (BillFormPropsBase & {
      mode: "edit";
      defaultValues?: Partial<BillInfo>;
      onSubmit: (data: UpdateBillInfoDto) => Promise<void>;
    });

function toFormValues(bill?: Partial<BillInfo> | null): Record<string, unknown> {
  if (!bill) return {};
  const billTypeObj =
    bill.billTypeId ?? (typeof bill.billType === "object" ? bill.billType : undefined);
  const billTypeId =
    typeof billTypeObj === "object" ? billTypeObj?._id : billTypeObj;
  return {
    memId: typeof bill.memId === "object" ? bill.memId?._id : bill.memId,
    fileId: typeof bill.fileId === "object" ? bill.fileId?._id : bill.fileId,
    billTypeId: billTypeId ?? "",
    billMonth: bill.billMonth ?? "",
    billAmount: bill.billAmount ?? 0,
    fineAmount: bill.fineAmount ?? 0,
    arrears: bill.arrears ?? 0,
    dueDate: bill.dueDate
      ? new Date(bill.dueDate).toISOString().split("T")[0]
      : "",
    gracePeriodDays: bill.gracePeriodDays ?? 7,
    notes: bill.notes ?? "",
    previousReading: bill.previousReading ?? undefined,
    currentReading: bill.currentReading ?? undefined,
  };
}

function toInitialRelationshipOptions(
  bill?: Partial<BillInfo> | null
): Record<string, { value: string; label: string }> | undefined {
  if (!bill) return undefined;
  const opts: Record<string, { value: string; label: string }> = {};
  const mem =
    typeof bill.memId === "object" ? bill.memId : null;
  if (mem?._id) {
    opts.memId = {
      value: String(mem._id),
      label: (mem as { memName?: string }).memName ?? "—",
    };
  }
  const file =
    typeof bill.fileId === "object" ? bill.fileId : null;
  if (file?._id) {
    opts.fileId = {
      value: String(file._id),
      label: (file as { fileRegNo?: string }).fileRegNo ?? "—",
    };
  }
  const bt =
    typeof bill.billTypeId === "object"
      ? bill.billTypeId
      : typeof bill.billType === "object"
        ? bill.billType
        : null;
  if (bt?._id) {
    opts.billTypeId = {
      value: String(bt._id),
      label: (bt as { billTypeName?: string }).billTypeName ?? "—",
    };
  }
  return Object.keys(opts).length ? opts : undefined;
}

export function BillForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: BillFormProps) {
  const values = toFormValues(defaultValues as BillInfo);
  const initialRelationshipOptions = toInitialRelationshipOptions(
    defaultValues as BillInfo
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const payload: CreateBillInfoDto | UpdateBillInfoDto = {
      memId: data.memId as string,
      fileId: data.fileId as string,
      billTypeId: data.billTypeId as string,
      billMonth: String(data.billMonth || "").trim(),
      billAmount: Number(data.billAmount) || 0,
      fineAmount: Number(data.fineAmount) || 0,
      arrears: Number(data.arrears) || 0,
      dueDate: data.dueDate
        ? new Date(data.dueDate as string).toISOString()
        : new Date().toISOString(),
      gracePeriodDays: Number(data.gracePeriodDays) || 7,
      notes: (data.notes as string) || undefined,
      previousReading: data.previousReading
        ? Number(data.previousReading)
        : undefined,
      currentReading: data.currentReading
        ? Number(data.currentReading)
        : undefined,
    };
    if (mode === "edit") {
      const { memId, fileId, billTypeId, billMonth, ...updatePayload } = payload;
      await onSubmit(updatePayload as UpdateBillInfoDto);
    } else {
      await onSubmit(payload as CreateBillInfoDto);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <EntityForm
          schema={billInfoSchema}
          fields={billInfoFormFields as FieldConfig<Record<string, unknown>>[]}
          defaultValues={values}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel={mode === "create" ? "Create Bill" : "Update Bill"}
          cancelLabel="Cancel"
          isLoading={isLoading}
          initialRelationshipOptions={initialRelationshipOptions}
        />
      </CardContent>
    </Card>
  );
}
