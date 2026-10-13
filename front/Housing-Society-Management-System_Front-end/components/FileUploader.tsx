// frontend/src/lib/upload/components/FileUploader.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteFile,
  useFilesByEntity,
  useUploadConfig,
  useUploadFile,
  useUploadMultipleFiles,
} from "@/lib/hooks/entities/useFiles";
import { EntityType } from "@/lib/types/upload.types";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/format";
import { File, Loader2, Upload } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { customToast } from "@/lib/utils/customToast";
import { FilePreview } from "./FilePreview";
import { UploadProgress } from "./UploadProgress";

export interface FileUploaderProps {
  entityType: EntityType;
  entityId: string;
  uploadedBy: string;

  // Configuration
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  allowedTypes?: ("image" | "pdf" | "document")[];

  // Features
  showPreview?: boolean;
  showUploadedFiles?: boolean;
  dragDrop?: boolean;
  tabs?: boolean;

  // Callbacks
  onUploadComplete?: (files: any[]) => void;
  onFileSelect?: (files: File[]) => void;
  onError?: (error: string) => void;

  // UI
  label?: string;
  description?: string;
  uploadButtonText?: string;
  className?: string;

  // Metadata
  metadata?: Record<string, any>;
}

export function FileUploader({
  entityType,
  entityId,
  uploadedBy,

  // Configuration
  multiple = false,
  maxFiles = 10,
  maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760"),
  accept = {
    "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "application/vnd.ms-powerpoint": [".ppt"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      [".pptx"],
    "text/plain": [".txt"],
  },
  allowedTypes = ["image", "pdf", "document"],

  // Features
  showPreview = true,
  showUploadedFiles = true,
  dragDrop = true,
  tabs = true,

  // Callbacks
  onUploadComplete,
  onFileSelect,
  onError,

  // UI
  label = "Upload Files",
  description = "Drag & drop files here, or click to select",
  uploadButtonText = "Upload",
  className,

  // Metadata
  metadata = {},
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, "uploading" | "success" | "error" | "pending">
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("upload");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { data: config, isLoading: configLoading } = useUploadConfig();
  const uploadSingle = useUploadFile();
  const uploadMultiple = useUploadMultipleFiles();
  const deleteFile = useDeleteFile();
  const {
    data: uploadedFiles = [],
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useFilesByEntity(entityType, entityId);

  // Filter accept based on allowedTypes
  const filteredAccept = React.useMemo(() => {
    const filtered: Record<string, string[]> = {};

    if (allowedTypes.includes("image")) {
      filtered["image/*"] = accept["image/*"] || [];
    }

    if (allowedTypes.includes("pdf")) {
      filtered["application/pdf"] = accept["application/pdf"] || [".pdf"];
    }

    if (allowedTypes.includes("document")) {
      Object.keys(accept).forEach((key) => {
        if (
          key.includes("document") ||
          key.includes("sheet") ||
          key.includes("presentation") ||
          key.includes("text/")
        ) {
          filtered[key] = accept[key];
        }
      });
    }

    return filtered;
  }, [accept, allowedTypes]);

  // Format bytes
  const formatFileSize = (bytes: number) => {
    return formatBytes(bytes);
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    const errors: string[] = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType = Object.values(filteredAccept).some((extensions) =>
      extensions.includes(fileExtension),
    );

    if (!isValidType) {
      const allowedExtensions = Object.values(filteredAccept).flat().join(", ");
      errors.push(`File type not allowed. Allowed: ${allowedExtensions}`);
    }

    // Check max files
    if (files.length >= maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    return errors.length > 0 ? errors.join(" ") : null;
  };

  // Handle file drop/selection
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      rejectedFiles.forEach(({ file, errors }) => {
        const errorMessage = errors.map((e: any) => e.message).join(", ");
        setErrors((prev) => ({ ...prev, [file.name]: errorMessage }));
        customToast.error(`${file.name}: ${errorMessage}`);
      });

      // Validate and add accepted files
      const newFiles = acceptedFiles.filter((file) => {
        const error = validateFile(file);
        if (error) {
          setErrors((prev) => ({ ...prev, [file.name]: error }));
          return false;
        }
        return true;
      });

      // Add to files list
      if (multiple) {
        setFiles((prev) => [
          ...prev,
          ...newFiles.slice(0, maxFiles - prev.length),
        ]);
      } else {
        setFiles(newFiles.slice(0, 1));
      }

      // Call onFileSelect callback
      if (onFileSelect) {
        onFileSelect(newFiles);
      }
    },
    [files.length, maxFiles, maxSize, multiple, filteredAccept, onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxFiles,
    maxSize,
    accept: filteredAccept,
    disabled: uploadSingle.isPending || uploadMultiple.isPending,
  });

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    const file = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    delete uploadProgress[file.name];
    delete uploadStatus[file.name];
    delete errors[file.name];
  };

  // Handle file deletion
  const handleDeleteFile = async (id: string) => {
    try {
      await deleteFile.mutateAsync({ id, deletedBy: uploadedBy });
      customToast.success("File deleted successfully");
      refetchFiles();
    } catch (error: any) {
      customToast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      customToast.error("No files selected");
      return;
    }

    // Set initial status
    files.forEach((file) => {
      setUploadStatus((prev) => ({ ...prev, [file.name]: "uploading" }));
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
    });

    try {
      // Update progress (simulated)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          Object.keys(newProgress).forEach((key) => {
            if (newProgress[key] < 90) {
              newProgress[key] += 10;
            }
          });
          return newProgress;
        });
      }, 200);

      let uploadedResults;

      if (files.length === 1) {
        uploadedResults = await uploadSingle.mutateAsync({
          entityType,
          entityId,
          uploadedBy,
          file: files[0],
          metadata,
        });
      } else {
        uploadedResults = await uploadMultiple.mutateAsync({
          files,
          entityType,
          entityId,
          uploadedBy,
          metadata,
        });
      }

      clearInterval(progressInterval);

      // Set final progress and status
      files.forEach((file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        setUploadStatus((prev) => ({ ...prev, [file.name]: "success" }));
      });

      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(
          Array.isArray(uploadedResults) ? uploadedResults : [uploadedResults],
        );
      }

      // Refetch uploaded files
      refetchFiles();

      // Clear after delay
      setTimeout(() => {
        setFiles([]);
        setUploadProgress({});
        setUploadStatus({});
        setErrors({});
      }, 2000);
    } catch (error: any) {
      // Set error status
      files.forEach((file) => {
        setUploadStatus((prev) => ({ ...prev, [file.name]: "error" }));
      });

      const errorMessage = error.response?.data?.message || "Upload failed";
      customToast.error(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    setFiles([]);
    setUploadProgress({});
    setUploadStatus({});
    setErrors({});
  };

  // Handle retry upload
  const handleRetryUpload = (fileName: string) => {
    const file = files.find((f) => f.name === fileName);
    if (file) {
      setUploadStatus((prev) => ({ ...prev, [fileName]: "uploading" }));
      setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));

      // In a real app, you would retry the upload here
      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, [fileName]: 100 }));
        setUploadStatus((prev) => ({ ...prev, [fileName]: "success" }));
      }, 1000);
    }
  };

  const isUploading = uploadSingle.isPending || uploadMultiple.isPending;
  const hasSelectedFiles = files.length > 0;
  const hasUploadedFiles = uploadedFiles.length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {tabs ? (
        <Tabs
          defaultValue="upload"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="uploaded">
              Uploaded Files {hasUploadedFiles && `(${uploadedFiles.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {renderUploadSection()}
          </TabsContent>

          <TabsContent value="uploaded" className="space-y-4">
            {renderUploadedFilesSection()}
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {renderUploadSection()}
          {showUploadedFiles && renderUploadedFilesSection()}
        </>
      )}
    </div>
  );

  // Render upload section
  function renderUploadSection() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{label}</CardTitle>
          <CardDescription>
            {description}
            {config && (
              <span className="block mt-1 text-sm">
                Max file size: {formatFileSize(config.maxFileSize)} • Max files:{" "}
                {maxFiles} • Allowed:{" "}
                {Object.values(filteredAccept).flat().join(", ")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dropzone */}
          {dragDrop && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400",
                (isUploading || configLoading) &&
                  "opacity-50 cursor-not-allowed",
              )}
            >
              <input {...getInputProps()} ref={fileInputRef} className='enhanced-input h-11'
/>

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-gray-100 p-4">
                  {isDragActive ? (
                    <Upload className="h-8 w-8 text-primary" />
                  ) : (
                    <File className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive
                      ? "Drop files here"
                      : "Drag & drop files here"}
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse files
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading || configLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Select Files
                </Button>
              </div>
            </div>
          )}

          {/* Selected Files */}
          {hasSelectedFiles && showPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Selected Files ({files.length})
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="space-y-2">
                    <FilePreview
                      file={file}
                      onRemove={() => handleRemoveFile(index)}
                      isUploading={uploadStatus[file.name] === "uploading"}
                      uploadProgress={uploadProgress[file.name] || 0}
                    />

                    {uploadStatus[file.name] &&
                      uploadStatus[file.name] !== "success" && (
                        <UploadProgress
                          fileName={file.name}
                          progress={uploadProgress[file.name] || 0}
                          status={uploadStatus[file.name]}
                          error={errors[file.name]}
                          onRetry={() => handleRetryUpload(file.name)}
                        />
                      )}

                    {errors[file.name] && !uploadStatus[file.name] && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors[file.name]}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {hasSelectedFiles && (
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || !hasSelectedFiles}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadButtonText}{" "}
                    {files.length > 1 ? `(${files.length})` : ""}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render uploaded files section
  function renderUploadedFilesSection() {
    if (filesLoading) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Loading files...</p>
          </CardContent>
        </Card>
      );
    }

    if (!hasUploadedFiles) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <File className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-lg font-medium text-gray-900">
              No files uploaded yet
            </p>
            <p className="text-sm text-gray-500">
              Upload your first file using the upload tab
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>
            {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""}{" "}
            uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <FilePreview
                key={file._id}
                file={file}
                onDelete={handleDeleteFile}
                onDownload={(url, filename) => {
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                onView={(url) => window.open(url, "_blank")}
                showActions={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
}
