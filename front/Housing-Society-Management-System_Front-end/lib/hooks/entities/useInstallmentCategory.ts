// src/lib/hooks/entities/useInstallmentCategory.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateInstallmentCategoryDto,
  InstallmentCategory,
  InstallmentCategoryOption,
  InstallmentCategoryQueryParams,
  InstallmentCategorySummary,
  ReorderCategoryDto,
  UpdateInstallmentCategoryDto,
} from "@/lib/types/installmentCategory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "installment-categories";

export const useInstallmentCategories = (params: InstallmentCategoryQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, any> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };

      if (params.search) queryParams.search = params.search;
      if (params.isRefundable !== undefined) queryParams.isRefundable = params.isRefundable;
      if (params.isMandatory !== undefined) queryParams.isMandatory = params.isMandatory;
      if (params.isActive !== undefined) queryParams.isActive = params.isActive;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<{
        categories: InstallmentCategory[];
        pagination: PaginatedResponse<InstallmentCategory>["pagination"];
      }>("/installmentcategory", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.categories,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch categories");
    },
  });
};

export const useActiveInstallmentCategories = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentCategory[]>("/installmentcategory/active");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch active categories"
      );
    },
  });
};

export const useMandatoryInstallmentCategories = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "mandatory"],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentCategory[]>(
        "/installmentcategory/mandatory"
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch mandatory categories"
      );
    },
  });
};

export const useInstallmentCategory = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentCategory>(
        `/installmentcategory/${id}`
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch category");
    },
    enabled: !!id,
  });
};

export const useInstallmentCategoryOptions = (includeInactive: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEY, "options", includeInactive],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentCategoryOption[]>(
        "/installmentcategory/options",
        { params: { includeInactive } }
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch category options"
      );
    },
  });
};

export const useInstallmentCategoryStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentCategorySummary>(
        "/installmentcategory/statistics"
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch category statistics"
      );
    },
  });
};

export const useCreateInstallmentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInstallmentCategoryDto): Promise<InstallmentCategory> => {
      const response = await apiClient.post<InstallmentCategory>("/installmentcategory", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create category");
    },
    onSuccess: () => {
      customToast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create category");
    },
  });
};

export const useUpdateInstallmentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInstallmentCategoryDto;
    }): Promise<InstallmentCategory> => {
      const response = await apiClient.put<InstallmentCategory>(
        `/installmentcategory/${id}`,
        data
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update category");
    },
    onSuccess: (_, variables) => {
      customToast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update category");
    },
  });
};

export const useDeleteInstallmentCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/installmentcategory/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete category");
      }
    },
    onSuccess: () => {
      customToast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete category");
    },
  });
};

export const useSeedDefaultCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ created: number; updated: number; skipped: number }> => {
      const response = await apiClient.post<any>("/installmentcategory/seed-default");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to seed default categories");
    },
    onSuccess: (data) => {
      customToast.success(`Default categories seeded: ${data.created} created, ${data.updated} updated, ${data.skipped} skipped`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to seed default categories");
    },
  });
};

export const useValidateSequenceOrder = (sequenceOrder: number, excludeId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "validate-sequence", sequenceOrder, excludeId],
    queryFn: async () => {
      const params: Record<string, any> = { sequenceOrder };
      if (excludeId) params.excludeId = excludeId;

      const response = await apiClient.get<{ isValid: boolean; message?: string }>(
        "/installmentcategory/validate-sequence",
        { params }
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to validate sequence order"
      );
    },
    enabled: !!sequenceOrder,
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderCategoryDto): Promise<{ success: boolean }> => {
      const response = await apiClient.post<any>("/installmentcategory/reorder", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to reorder categories");
    },
    onSuccess: () => {
      customToast.success("Categories reordered successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to reorder categories");
    },
  });
};

export const useToggleInstallmentCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<InstallmentCategory> => {
      const response = await apiClient.put<InstallmentCategory>(
        `/installmentcategory/${id}`,
        { isActive }
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to toggle status");
    },
    onSuccess: (_, variables) => {
      customToast.success(`Category ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle status");
    },
  });
};
