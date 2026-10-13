// lib/hooks/useImageUpload.ts
import { uploadApi } from "@/lib/API/upload-api";
import { EntityType } from "@/lib/types/upload.types";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";

interface UseImageUploadProps {
  entityType: EntityType;
  entityId: string;
  uploadedBy: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useImageUpload({
  entityType,
  entityId,
  uploadedBy,
  onSuccess,
  onError,
}: UseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload to backend (which uploads to Cloudinary)
      const uploadedFile = await uploadApi.uploadSingle({
        file,
        entityType,
        entityId,
        uploadedBy,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const cloudinaryUrl = uploadedFile.secureUrl;
      setUploadedUrl(cloudinaryUrl);

      // Success callback
      if (onSuccess) {
        onSuccess(cloudinaryUrl);
      }

      customToast.success("Image uploaded successfully");
      return cloudinaryUrl;
    } catch (error: any) {
      console.error("Image upload failed:", error);

      // Error callback
      if (onError) {
        onError(error);
      }

      let errorMessage = "Failed to upload image";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      customToast.error(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const removeImage = async (publicId?: string) => {
    if (publicId) {
      try {
        // If you want to delete from Cloudinary, you'd need a delete endpoint
        // await uploadApi.deleteFile(publicId, uploadedBy)
        customToast.success("Image removed");
      } catch (error) {
        console.error("Failed to delete image:", error);
        customToast.error("Failed to delete image");
      }
    }

    setUploadedUrl(null);
    setProgress(0);
  };

  return {
    uploadImage,
    removeImage,
    isUploading,
    progress,
    uploadedUrl,
    reset: () => {
      setUploadedUrl(null);
      setProgress(0);
    },
  };
}
