"use client";

import {
  EntityForm,
  FieldConfig,
} from "@/components/shared/EntityForm/EntityForm";
import { Card, CardContent } from "@/components/ui/card";
import { registryFormFields } from "@/lib/constants/registryForm.constants";
import { registrySchema } from "@/lib/schemas/registry.schema";
import {
  CreateRegistryDto,
  UpdateRegistryDto,
  Registry,
} from "@/lib/types/registry";
import { useMemo } from "react";

export interface RegistryFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateRegistryDto & Registry>;
  onSubmit: (data: CreateRegistryDto | UpdateRegistryDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function toFormValues(registry?: Partial<Registry> | null): Record<string, unknown> {
  if (!registry) return {};
  return {
    memId: typeof registry.memId === "object" ? registry.memId?._id : registry.memId,
    plotId: typeof registry.plotId === "object" ? registry.plotId?._id : registry.plotId,
    registryNo: registry.registryNo ?? "",
    mutationNo: registry.mutationNo ?? "",
    mutationDate: registry.mutationDate
      ? new Date(registry.mutationDate).toISOString().split("T")[0]
      : "",
    areaKanal: registry.areaKanal ?? undefined,
    areaMarla: registry.areaMarla ?? undefined,
    areaSqft: registry.areaSqft ?? undefined,
    mozaVillage: registry.mozaVillage ?? "",
    khasraNo: registry.khasraNo ?? "",
    khewatNo: registry.khewatNo ?? "",
    khatoniNo: registry.khatoniNo ?? "",
    legalOfficeDetails: registry.legalOfficeDetails ?? "",
    subRegistrarName: registry.subRegistrarName ?? "",
    agreementDate: registry.agreementDate
      ? new Date(registry.agreementDate).toISOString().split("T")[0]
      : "",
    stampPaperNo: registry.stampPaperNo ?? "",
    bookNo: registry.bookNo ?? "",
    volumeNo: registry.volumeNo ?? "",
    documentNo: registry.documentNo ?? "",
    reportNo: registry.reportNo ?? "",
    scanCopyPath: registry.scanCopyPath ?? "",
    landOwnerPhoto: registry.landOwnerPhoto ?? "",
    remarks: registry.remarks ?? "",
  };
}

export function RegistryForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: RegistryFormProps) {
  const entityId = (defaultValues as Registry)?._id || "temp-registry";

  const fields = useMemo(() => {
    return registryFormFields.map((field) => {
      if (
        (field.name === "scanCopyPath" || field.name === "landOwnerPhoto") &&
        field.uploadConfig
      ) {
        return {
          ...field,
          uploadConfig: {
            ...field.uploadConfig,
            entityId,
          },
        };
      }
      return field;
    }) as FieldConfig<Record<string, unknown>>[];
  }, [entityId]);

  const values = useMemo(
    () => toFormValues(defaultValues as Registry),
    [defaultValues]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const payload: CreateRegistryDto | UpdateRegistryDto = {
      memId: data.memId as string,
      plotId: data.plotId as string,
      registryNo: String(data.registryNo || "").toUpperCase(),
      mutationNo: String(data.mutationNo || "").toUpperCase(),
      mutationDate: data.mutationDate
        ? new Date(data.mutationDate as string).toISOString()
        : undefined,
      areaKanal: data.areaKanal as number | undefined,
      areaMarla: data.areaMarla as number | undefined,
      areaSqft: data.areaSqft as number | undefined,
      mozaVillage: (data.mozaVillage as string) || undefined,
      khasraNo: (data.khasraNo as string) || undefined,
      khewatNo: (data.khewatNo as string) || undefined,
      khatoniNo: (data.khatoniNo as string) || undefined,
      legalOfficeDetails: (data.legalOfficeDetails as string) || undefined,
      subRegistrarName: (data.subRegistrarName as string) || undefined,
      agreementDate: data.agreementDate
        ? new Date(data.agreementDate as string).toISOString()
        : undefined,
      stampPaperNo: (data.stampPaperNo as string) || undefined,
      bookNo: (data.bookNo as string) || undefined,
      volumeNo: (data.volumeNo as string) || undefined,
      documentNo: (data.documentNo as string) || undefined,
      reportNo: (data.reportNo as string) || undefined,
      scanCopyPath: (data.scanCopyPath as string) || undefined,
      landOwnerPhoto: (data.landOwnerPhoto as string) || undefined,
      remarks: (data.remarks as string) || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <EntityForm
          schema={registrySchema}
          fields={fields}
          defaultValues={values}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel={mode === "create" ? "Create Registry" : "Update Registry"}
          cancelLabel="Cancel"
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
