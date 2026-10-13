"use client";

import {
  EntityForm,
  FieldConfig,
} from "@/components/shared/EntityForm/EntityForm";
import { Card, CardContent } from "@/components/ui/card";
import { defaulterFormFields } from "@/lib/constants/defaulterForm.constants";
import { defaulterSchema } from "@/lib/schemas/defaulter.schema";
import {
  CreateDefaulterDto,
  UpdateDefaulterDto,
  Defaulter,
} from "@/lib/types/defaulter";
import { useMemo } from "react";

type DefaulterFormPropsBase = {
  onCancel: () => void;
  isLoading?: boolean;
};

export type DefaulterFormProps =
  | (DefaulterFormPropsBase & {
      mode: "create";
      defaultValues?: Partial<Defaulter>;
      onSubmit: (data: CreateDefaulterDto) => Promise<void>;
    })
  | (DefaulterFormPropsBase & {
      mode: "edit";
      defaultValues?: Partial<Defaulter>;
      onSubmit: (data: UpdateDefaulterDto) => Promise<void>;
    });

function toFormValues(
  defaulter?: Partial<Defaulter> | null
): Record<string, unknown> {
  if (!defaulter) return {};
  return {
    memId: typeof defaulter.memId === "object" ? defaulter.memId?._id : defaulter.memId,
    plotId: typeof defaulter.plotId === "object" ? defaulter.plotId?._id : defaulter.plotId,
    fileId: typeof defaulter.fileId === "object" ? defaulter.fileId?._id : defaulter.fileId,
    totalOverdueAmount: defaulter.totalOverdueAmount ?? 0,
    lastPaymentDate: defaulter.lastPaymentDate
      ? new Date(defaulter.lastPaymentDate).toISOString().split("T")[0]
      : "",
    noticeSentCount: defaulter.noticeSentCount ?? 0,
    remarks: defaulter.remarks ?? "",
    status: defaulter.status ?? undefined,
  };
}

export function DefaulterForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: DefaulterFormProps) {
  const fields = useMemo(
    () => defaulterFormFields as FieldConfig<Record<string, unknown>>[],
    []
  );

  const values = useMemo(
    () => toFormValues(defaultValues as Defaulter),
    [defaultValues]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const payload: CreateDefaulterDto | UpdateDefaulterDto = {
      memId: data.memId as string,
      plotId: data.plotId as string,
      fileId: data.fileId as string,
      totalOverdueAmount: Number(data.totalOverdueAmount) || 0,
      lastPaymentDate: data.lastPaymentDate
        ? new Date(data.lastPaymentDate as string).toISOString()
        : undefined,
      noticeSentCount: Number(data.noticeSentCount) || 0,
      remarks: (data.remarks as string) || undefined,
    };
    if (mode === "edit") {
      (payload as UpdateDefaulterDto).status = data.status as any;
    }
    await onSubmit(payload);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <EntityForm
          schema={defaulterSchema}
          fields={fields}
          defaultValues={values}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel={mode === "create" ? "Create Defaulter" : "Update Defaulter"}
          cancelLabel="Cancel"
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
