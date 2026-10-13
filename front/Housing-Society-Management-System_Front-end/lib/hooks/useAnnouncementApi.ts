"use client";

import { apiClient } from "@/lib/API/client";
import { uploadApi } from "@/lib/API/upload-api";
import type {
  Announcement,
  AnnouncementQueryParams,
  CreateAnnouncementDto,
  PublishAnnouncementDto,
} from "@/lib/types/announcement";
import type { AnnouncementCategory } from "@/lib/types/announcementCategory";
import type { ApiResponse } from "@/lib/types/api";
import { EntityType } from "@/lib/types/upload.types";
import { useCallback, useMemo, useState } from "react";

export type TargetType = "All" | "Block" | "Project" | "Individual";

export type TargetGroupOption = {
  id: string;
  label: string;
};

type LoadingState = {
  announcements: boolean;
  categories: boolean;
  targets: boolean;
  create: boolean;
  publish: boolean;
  upload: boolean;
};

const defaultLoadingState: LoadingState = {
  announcements: false,
  categories: false,
  targets: false,
  create: false,
  publish: false,
  upload: false,
};

const extractArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const candidates = [
    "items",
    "announcements",
    "announcementCategories",
    "plotBlocks",
    "projects",
    "userstaffs",
    "userStaffs",
    "data",
  ];

  for (const key of candidates) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate;
  }

  if (record.data && typeof record.data === "object") {
    return extractArray(record.data);
  }

  return [];
};

const unwrap = <T>(response: { data: ApiResponse<T> }): T => {
  if (response.data?.success) {
    return response.data.data;
  }
  throw new Error(response.data?.message || "Request failed");
};

export function useAnnouncementApi() {
  const [loading, setLoading] = useState<LoadingState>(defaultLoadingState);
  const [error, setError] = useState<string | null>(null);

  const setLoadingState = useCallback(
    (key: keyof LoadingState, value: boolean) => {
      setLoading((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetError = useCallback(() => setError(null), []);

  const fetchAnnouncements = useCallback(
    async (params: AnnouncementQueryParams = {}): Promise<Announcement[]> => {
      setLoadingState("announcements", true);
      resetError();

      try {
        const response = await apiClient.get<{
          announcements: Announcement[];
        }>("/announcement", { params });
        const data = unwrap(response);
        const announcements = extractArray(data) as Announcement[];
        return announcements;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load announcements";
        setError(message);
        throw err;
      } finally {
        setLoadingState("announcements", false);
      }
    },
    [resetError, setLoadingState],
  );

  const fetchCategories = useCallback(async (): Promise<
    AnnouncementCategory[]
  > => {
    setLoadingState("categories", true);
    resetError();

    try {
      const response = await apiClient.get<AnnouncementCategory[]>(
        "/announcementcategory/active",
      );
      const data = unwrap(response);
      const categories = extractArray(data) as AnnouncementCategory[];
      return categories;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load categories";
      setError(message);
      throw err;
    } finally {
      setLoadingState("categories", false);
    }
  }, [resetError, setLoadingState]);

  const fetchTargetGroups = useCallback(
    async (targetType: TargetType): Promise<TargetGroupOption[]> => {
      if (targetType === "All") return [];

      setLoadingState("targets", true);
      resetError();

      const endpoint =
        targetType === "Block"
          ? "/plotblocks"
          : targetType === "Project"
            ? "/projects"
            : "/userstaff";

      try {
        const response = await apiClient.get<unknown>(endpoint);
        const data = unwrap(response);
        const items = extractArray(data) as Array<Record<string, unknown>>;

        return items.map((item) => {
          if (targetType === "Block") {
            return {
              id: String(item._id ?? ""),
              label: String(item.plotBlockName ?? item.name ?? "Unnamed block"),
            };
          }
          if (targetType === "Project") {
            return {
              id: String(item._id ?? ""),
              label: String(item.projName ?? item.name ?? "Unnamed project"),
            };
          }
          return {
            id: String(item._id ?? ""),
            label: String(
              item.fullName ?? item.userName ?? item.name ?? "Unnamed user",
            ),
          };
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load target groups";
        setError(message);
        throw err;
      } finally {
        setLoadingState("targets", false);
      }
    },
    [resetError, setLoadingState],
  );

  const createAnnouncement = useCallback(
    async (
      payload: CreateAnnouncementDto,
      file?: File,
      uploadedBy?: string,
    ) => {
      setLoadingState("create", true);
      resetError();

      try {
        let attachmentURL = payload.attachmentURL;

        if (file) {
          setLoadingState("upload", true);
          const uploadResult = await uploadApi.uploadSingle({
            file,
            entityType: EntityType.ANNOUNCEMENT,
            entityId: "temp-announcement",
            uploadedBy: uploadedBy || "system",
          });
          attachmentURL = uploadResult.secureUrl;
        }

        const response = await apiClient.post<Announcement>("/announcement", {
          ...payload,
          attachmentURL,
        });
        return unwrap(response);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create announcement";
        setError(message);
        throw err;
      } finally {
        setLoadingState("upload", false);
        setLoadingState("create", false);
      }
    },
    [resetError, setLoadingState],
  );

  const publishAnnouncement = useCallback(
    async (id: string, data: PublishAnnouncementDto = {}) => {
      setLoadingState("publish", true);
      resetError();

      try {
        const response = await apiClient.patch<Announcement>(
          `/announcement/${id}/publish`,
          data,
        );
        return unwrap(response);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to publish announcement";
        setError(message);
        throw err;
      } finally {
        setLoadingState("publish", false);
      }
    },
    [resetError, setLoadingState],
  );

  const isLoading = useMemo(() => loading, [loading]);

  return {
    error,
    isLoading,
    fetchAnnouncements,
    fetchCategories,
    fetchTargetGroups,
    createAnnouncement,
    publishAnnouncement,
  };
}
