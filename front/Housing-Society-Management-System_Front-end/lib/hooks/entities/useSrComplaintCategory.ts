// src/lib/hooks/entities/useSrComplaintCategory.ts
import { apiClient } from "@/lib/API/client";
import { complaintCategoryApi } from "@/lib/API/complaintCategoryApi";
import type { SrComplaintCategoryQueryParams } from "@/lib/types/srComplaintCategory";
import {
  BulkUpdateResult,
  CategoryStatistics,
  CreateSrComplaintCategoryDto,
  GetSrComplaintCategoriesResult,
  ImportCategoriesResult,
  SrComplaintCategoryType,
  UpdateSrComplaintCategoryDto,
} from "@/lib/types/srComplaintCategory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "srComplaintCategories";

export const useSrComplaintCategories = (
  params: SrComplaintCategoryQueryParams = {},
) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async (): Promise<GetSrComplaintCategoriesResult> => {
      const response = await complaintCategoryApi.getCategories(params);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSrComplaintCategory = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<SrComplaintCategoryType> => {
      const response = await complaintCategoryApi.getCategoryById(id);
      return response.data.data;
    },

    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const categoriesData =
        queryClient.getQueryData<GetSrComplaintCategoriesResult>([
          QUERY_KEY,
          {},
        ]);
      return categoriesData?.complaintCategories.find(
        (c: SrComplaintCategoryType) => c._id === id,
      );
    },
  });
};

export const useActiveSrComplaintCategories = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async (): Promise<SrComplaintCategoryType[]> => {
      const response = await complaintCategoryApi.getActiveCategories();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useHighPriorityCategories = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "high-priority"],
    queryFn: async (): Promise<SrComplaintCategoryType[]> => {
      const response = await apiClient.get<SrComplaintCategoryType[]>(
        "/complaincatg/high-priority",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch high priority categories",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUrgentSlaCategories = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "urgent-sla"],
    queryFn: async (): Promise<SrComplaintCategoryType[]> => {
      const response = await apiClient.get<SrComplaintCategoryType[]>(
        "/complaincatg/urgent-sla",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch urgent SLA categories",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSrComplaintCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateSrComplaintCategoryDto,
    ): Promise<SrComplaintCategoryType> => {
      const response = await complaintCategoryApi.createCategory(data);
      return response.data.data;
    },
    onSuccess: () => {
      customToast.success("Complaint category created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create complaint category");
    },
  });
};

export const useUpdateSrComplaintCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSrComplaintCategoryDto;
    }): Promise<SrComplaintCategoryType> => {
      const response = await complaintCategoryApi.updateCategory(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      customToast.success("Complaint category updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update complaint category");
    },
  });
};

export const useDeleteSrComplaintCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await complaintCategoryApi.deleteCategory(id);
    },
    onSuccess: () => {
      customToast.success("Complaint category deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete complaint category");
    },
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<SrComplaintCategoryType> => {
      const response = await complaintCategoryApi.toggleCategoryStatus(id);
      return response.data.data;
    },
    onSuccess: (_, id) => {
      customToast.success("Category status updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle category status");
    },
  });
};

export const useBulkUpdateCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryIds,
      isActive,
    }: {
      categoryIds: string[];
      isActive: boolean;
    }): Promise<BulkUpdateResult> => {
      const response = await complaintCategoryApi.bulkUpdateCategoryStatus(
        categoryIds,
        isActive,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      customToast.success(`Updated ${data.modified} categories`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to bulk update categories");
    },
  });
};

export const useSrComplaintCategoryStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async (): Promise<CategoryStatistics> => {
      const response = await complaintCategoryApi.getCategoryStatistics();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategoriesForDropdown = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "dropdown"],
    queryFn: async () => {
      const response = await complaintCategoryApi.getCategoriesForDropdown();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchCategories = (
  searchTerm: string,
  filters?: {
    isActive?: boolean;
    minPriority?: number;
    maxPriority?: number;
    minSlaHours?: number;
    maxSlaHours?: number;
  },
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "search", searchTerm, filters],
    queryFn: async (): Promise<SrComplaintCategoryType[]> => {
      const response = await complaintCategoryApi.searchCategories(
        searchTerm,
        filters,
      );
      return response.data.data;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useImportSrComplaintCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      categories: CreateSrComplaintCategoryDto[],
    ): Promise<ImportCategoriesResult> => {
      const response = await complaintCategoryApi.importCategories(categories);
      return response.data.data;
    },
    onSuccess: (data) => {
      customToast.success(`Imported ${data.success} categories successfully`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to import categories");
    },
  });
};
