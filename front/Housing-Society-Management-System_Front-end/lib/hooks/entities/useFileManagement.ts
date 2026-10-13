// lib/hooks/entities/useFileManagement.ts
import { EntityType, UploadedFile } from "@/lib/types/upload.types";
import { useState } from "react";

interface UseFileManagementProps {
  entityType: EntityType;
  entityId: string;
}

export function useFileManagementModal({
  entityType,
  entityId,
}: UseFileManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleUploadComplete = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    closeModal();
  };

  return {
    isOpen,
    openModal,
    closeModal,
    uploadedFiles,
    handleUploadComplete,
  };
}

interface UseFileGalleryProps {
  files: UploadedFile[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function useFileGallery({
  files,
  isLoading = false,
  onRefresh,
}: UseFileGalleryProps) {
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  return {
    files,
    isLoading,
    onRefresh,
    previewFile,
    setPreviewFile,
    deletingFileId,
    setDeletingFileId,
  };
}
