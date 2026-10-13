// src/lib/hooks/entities/useAnnouncements.ts
import {
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnnouncementByIdQuery,
  useGetAnnouncementsQuery,
  usePublishAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from "@/lib/API/announcementApi";
import { AnnouncementQueryParams } from "@/lib/types/announcement";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import { customToast } from "@/lib/utils/customToast";

export const useAnnouncements = (params: AnnouncementQueryParams = {}) => {
  const result = useGetAnnouncementsQuery(params);
  return {
    ...result,
    data: result.data?.data,
  };
};

export const useAnnouncement = (id: string) => {
  return useGetAnnouncementByIdQuery(id, {
    skip: !id,
  });
};

export const useCreateAnnouncement = () => {
  const [createAnnouncement, result] = useCreateAnnouncementMutation();

  useEffect(() => {
    if (result.isSuccess) {
      customToast.success("Announcement created successfully");
    }
    if (result.isError) {
      const error = result.error as { data?: { message?: string } } | undefined;
      customToast.error(error?.data?.message || "Failed to create announcement");
    }
  }, [result.isSuccess, result.isError, result.error]);

  return [createAnnouncement, result] as const;
};

export const useUpdateAnnouncement = () => {
  const [updateAnnouncement, result] = useUpdateAnnouncementMutation();

  useEffect(() => {
    if (result.isSuccess) {
      customToast.success("Announcement updated successfully");
    }
    if (result.isError) {
      const error = result.error as { data?: { message?: string } } | undefined;
      customToast.error(error?.data?.message || "Failed to update announcement");
    }
  }, [result.isSuccess, result.isError, result.error]);

  return [updateAnnouncement, result] as const;
};

export const useDeleteAnnouncement = () => {
  const [deleteAnnouncement, result] = useDeleteAnnouncementMutation();

  useEffect(() => {
    if (result.isSuccess) {
      customToast.success("Announcement deleted successfully");
    }
    if (result.isError) {
      const error = result.error as { data?: { message?: string } } | undefined;
      customToast.error(error?.data?.message || "Failed to delete announcement");
    }
  }, [result.isSuccess, result.isError, result.error]);

  return [deleteAnnouncement, result] as const;
};

export const usePublishAnnouncement = () => {
  const [publishAnnouncement, result] = usePublishAnnouncementMutation();

  useEffect(() => {
    if (result.isSuccess) {
      customToast.success("Announcement published successfully");
    }
    if (result.isError) {
      const error = result.error as { data?: { message?: string } } | undefined;
      customToast.error(error?.data?.message || "Failed to publish announcement");
    }
  }, [result.isSuccess, result.isError, result.error]);

  return [publishAnnouncement, result] as const;
};

// Optional: lazy versions if you need them
export const useLazyAnnouncements = () => {
  return useGetAnnouncementsQuery(skipToken);
};
