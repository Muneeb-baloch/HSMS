// src/lib/hooks/entities/usePlotCategory.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  BulkPriceCalculationDto,
  CreatePlotCategoryDto,
  PlotCategory,
  PlotCategoryQueryParams,
  PriceCalculationDto,
  SurchargeInfo,
  UpdatePlotCategoryDto,
} from "@/lib/types/plotcategory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "plotCategories";

export const usePlotCategories = (params: PlotCategoryQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<{
        plotCategories: PlotCategory[];
        summary: any;
        pagination: PaginatedResponse<PlotCategory>["pagination"];
      }>("/plotcategories", { params });

      if (response.data.success) {
        return {
          items: response.data.data.plotCategories,
          summary: response.data.data.summary,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch plot categories",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlotCategory = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<PlotCategory>(
        `/plotcategories/${id}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch plot category");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const categoriesData = queryClient.getQueryData<any>([QUERY_KEY, {}]);
      return categoriesData?.items.find((c: PlotCategory) => c._id === id);
    },
  });
};

export const useActivePlotCategories = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async () => {
      const response = await apiClient.get<PlotCategory[]>(
        "/plotcategories/active",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch active plot categories",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePlotCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlotCategoryDto): Promise<PlotCategory> => {
      const response = await apiClient.post<PlotCategory>(
        "/plotcategories",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to create plot category",
      );
    },
    onSuccess: () => {
      customToast.success("Plot Category created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create plot category");
    },
  });
};

export const useUpdatePlotCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePlotCategoryDto;
    }): Promise<PlotCategory> => {
      const response = await apiClient.put<PlotCategory>(
        `/plotcategories/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to update plot category",
      );
    },
    onSuccess: (_, variables) => {
      customToast.success("Plot Category updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update plot category");
    },
  });
};

export const useDeletePlotCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/plotcategories/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete plot category",
        );
      }
    },
    onSuccess: () => {
      customToast.success("Plot Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete plot category");
    },
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<PlotCategory> => {
      const response = await apiClient.patch<PlotCategory>(
        `/plotcategories/${id}/toggle-status`,
        {},
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to toggle status");
    },
    onSuccess: (_, id) => {
      customToast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle status");
    },
  });
};

export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: async (data: PriceCalculationDto): Promise<SurchargeInfo> => {
      const response = await apiClient.post<any>(
        "/plotcategories/calculate/price",
        data,
      );

      if (response.data.success) {
        const data = response.data.data;
        // Handle different response structures
        if (data && typeof data === "object") {
          return (data as any).surchargeInfo || data;
        }
        return data;
      }
      throw new Error(response.data.message || "Failed to calculate price");
    },
    onSuccess: () => {
      customToast.success("Price calculated successfully");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to calculate price");
    },
  });
};

export const useCalculateBulkPrices = () => {
  return useMutation({
    mutationFn: async (
      data: BulkPriceCalculationDto,
    ): Promise<Record<string, SurchargeInfo>> => {
      const response = await apiClient.post<any>(
        "/plotcategories/calculate/bulk-prices",
        data,
      );

      if (response.data.success) {
        const data = response.data.data;
        // Handle different response structures
        if (data && typeof data === "object") {
          return (data as any).calculations || data;
        }
        return data;
      }
      throw new Error(
        response.data.message || "Failed to calculate bulk prices",
      );
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to calculate bulk prices");
    },
  });
};

export const useCategoryStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get<any>(
        "/plotcategories/stats/summary",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch statistics");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useBulkUpdateSurcharge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryIds,
      surchargePercentage,
      surchargeFixedAmount,
    }: {
      categoryIds: string[];
      surchargePercentage?: number;
      surchargeFixedAmount?: number;
    }): Promise<any> => {
      const response = await apiClient.post<any>(
        "/plotcategories/bulk-update-surcharge",
        {
          categoryIds,
          surchargePercentage,
          surchargeFixedAmount,
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update surcharge");
    },
    onSuccess: () => {
      customToast.success("Surcharge updated for selected categories");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update surcharge");
    },
  });
};

export const useCategoriesBySurchargeType = (
  type: "percentage" | "fixed" | "none",
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "surcharge-type", type],
    queryFn: async () => {
      const response = await apiClient.get<PlotCategory[]>(
        `/plotcategories/surcharge-type/${type}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch categories by surcharge type",
      );
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};
