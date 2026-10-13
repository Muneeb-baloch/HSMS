"use client";

import {
  EntityForm,
  FieldConfig,
} from "@/components/shared/EntityForm/EntityForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadApi } from "@/lib/API/upload-api";
import { complaintFormFields } from "@/lib/constants/complaintForm.constants";
import { complaintSchema } from "@/lib/schemas/complaint.schema";
import { EntityType } from "@/lib/types/upload.types";
import { formatBytes } from "@/lib/utils/file.utils";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  CreateComplaintDto,
  UpdateComplaintDto,
  Complaint,
} from "@/lib/types/complaint";
import { FileIcon, FileText, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { customToast } from "@/lib/utils/customToast";

const isImageUrl = (url: string) =>
  url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ||
  (url.includes("cloudinary") && url.includes("/image/"));

const isPdfUrl = (url: string) =>
  url.match(/\.pdf$/i) ||
  (url.includes("cloudinary") && url.includes(".pdf"));

function AttachmentsSection({
  urls,
  onAdd,
  onRemove,
  disabled,
  entityId,
}: {
  urls: string[];
  onAdd: (url: string) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
  entityId: string;
}) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const uploadedBy = user?.id || user?.email || "unknown";

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      const result = await uploadApi.uploadSingle({
        file,
        entityType: EntityType.DOCUMENT,
        entityId,
        uploadedBy,
      });
      return result.secureUrl;
    },
    [entityId, uploadedBy]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: { errors: { code?: string }[] }[]) => {
      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0]?.errors?.[0];
        if (err?.code === "file-too-large") {
          customToast.error(`File must be less than ${formatBytes(10 * 1024 * 1024)}`);
        } else {
          customToast.error("File rejected");
        }
        return;
      }
      for (const file of acceptedFiles) {
        try {
          setIsUploading(true);
          const url = await uploadFile(file);
          onAdd(url);
          customToast.success("File uploaded");
        } catch {
          customToast.error("Upload failed");
        } finally {
          setIsUploading(false);
        }
      }
    },
    [uploadFile, onAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [], ".doc": [], ".docx": [], "text/plain": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    disabled: disabled || isUploading,
  });

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Attachments</h4>
      {urls.length > 0 && (
        <div className="space-y-2">
          {urls.map((url) => (
            <div
              key={url}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                {isImageUrl(url) ? (
                  <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                    <Image
                      src={url}
                      alt="Attachment"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center shrink-0">
                    {isPdfUrl(url) ? (
                      <FileText className="h-6 w-6 text-red-500" />
                    ) : (
                      <FileIcon className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate"
                >
                  View file
                </a>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => onRemove(url)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        } ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm mt-2">Click or drag files to upload</p>
            <p className="text-xs text-gray-500 mt-1">
              Images, PDF, docs up to {formatBytes(10 * 1024 * 1024)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const formFieldsWithoutAttachments: FieldConfig<{
  memId: string;
  fileId: string;
  compCatId: string;
  compTitle: string;
  compDescription: string;
  compPriority: string;
  statusId: string;
  assignedTo: string;
}>[] = complaintFormFields.filter((f) => f.name !== "attachmentPaths") as any;

type ComplaintFormPropsBase = {
  onCancel: () => void;
  isLoading?: boolean;
};

export type ComplaintFormProps =
  | (ComplaintFormPropsBase & {
      mode: "create";
      defaultValues?: Partial<Complaint>;
      onSubmit: (data: CreateComplaintDto) => Promise<void>;
    })
  | (ComplaintFormPropsBase & {
      mode: "edit";
      defaultValues?: Partial<Complaint>;
      onSubmit: (data: UpdateComplaintDto) => Promise<void>;
    });

export function ComplaintForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: ComplaintFormProps) {
  const [attachmentPaths, setAttachmentPaths] = useState<string[]>(
    defaultValues?.attachmentPaths || []
  );
  const entityId = (defaultValues as Complaint)?._id || "temp-complaint";

  useEffect(() => {
    if (defaultValues?.attachmentPaths?.length) {
      setAttachmentPaths(defaultValues.attachmentPaths);
    }
  }, [defaultValues?.attachmentPaths]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const payload = {
      ...data,
      attachmentPaths,
      fileId: (data.fileId as string) || undefined,
      assignedTo: (data.assignedTo as string) || undefined,
    } as CreateComplaintDto | UpdateComplaintDto;
    await onSubmit(payload);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <EntityForm
          schema={complaintSchema}
          fields={formFieldsWithoutAttachments}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel={mode === "create" ? "Create Complaint" : "Update Complaint"}
          cancelLabel="Cancel"
          isLoading={isLoading}
        />
        <div className="mt-6 pt-6 border-t">
          <AttachmentsSection
            urls={attachmentPaths}
            onAdd={(url) => setAttachmentPaths((prev) => [...prev, url])}
            onRemove={(url) =>
              setAttachmentPaths((prev) => prev.filter((u) => u !== url))
            }
            disabled={isLoading}
            entityId={entityId}
          />
        </div>
      </CardContent>
    </Card>
  );
}
