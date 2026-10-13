// src/lib/hooks/entities/useAnnouncementCategory.ts
import { apiClient } from "@/lib/API/client";
import {
  AnnouncementCategory,
  AnnouncementCategoryQueryParams,
  AnnouncementCategoryStatistics,
  CreateAnnouncementCategoryDto,
  GetAnnouncementCategoriesResult,
  UpdateAnnouncementCategoryDto,
} from "@/lib/types/announcementCategory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "announcementCategories";

export const useAnnouncementCategories = (
  params: AnnouncementCategoryQueryParams = {},
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const response = await apiClient.get<GetAnnouncementCategoriesResult>(
        "/announcementcategory",
        {
          params,
        },
      );
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch categories");
    },
  });
};

export const useAnnouncementCategory = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<AnnouncementCategory>(
        `/announcementcategory/${id}`,
      );
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch category");
    },
    enabled: !!id,
  });
};

export const useAnnouncementCategoryStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get<AnnouncementCategoryStatistics>(
        "/announcementcategory/statistics",
      );
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch statistics");
    },
  });
};

export const useCreateAnnouncementCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAnnouncementCategoryDto) => {
      const res = await apiClient.post<AnnouncementCategory>(
        "/announcementcategory",
        data,
      );
      if (res.data.success) return res.data.data;
      throw new Error(res.data.message || "Failed to create");
    },
    onSuccess: () => {
      customToast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateAnnouncementCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAnnouncementCategoryDto;
    }) => {
      const res = await apiClient.put<AnnouncementCategory>(
        `/announcementcategory/${id}`,
        data,
      );
      if (res.data.success) return res.data.data;
      throw new Error(res.data.message || "Failed to update");
    },
    onSuccess: (data) => {
      customToast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
  });
};

export const useDeleteAnnouncementCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/announcementcategory/${id}`);
      if (!res.data.success)
        throw new Error(res.data.message || "Failed to delete");
    },
    onSuccess: () => {
      customToast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(
        `/announcementcategory/${id}/toggle-status`,
      );
      if (res.data.success) return res.data.data;
      throw new Error(res.data.message || "Failed to toggle");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
