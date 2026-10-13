// src/lib/hooks/entities/usePlotSize.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  AreaConversionDto,
  CreatePlotSizeDto,
  PlotSize,
  PlotSizeQueryParams,
  PlotSizeStatistics,
  PriceCalculationDto,
  UpdatePlotSizeDto,
} from "@/lib/types/plotsize";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "plotSizes";

export const usePlotSizes = (params: PlotSizeQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<{
        plotSizes: PlotSize[];
        summary: any;
        pagination: PaginatedResponse<PlotSize>["pagination"];
      }>("/plotsizes", { params });

      if (response.data.success) {
        return {
          items: response.data.data.plotSizes,
          summary: response.data.data.summary,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch plot sizes");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlotSize = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<PlotSize>(`/plotsizes/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch plot size");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const plotSizesData = queryClient.getQueryData<any>([QUERY_KEY, {}]);
      return plotSizesData?.items.find((p: PlotSize) => p._id === id);
    },
  });
};

export const useCreatePlotSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlotSizeDto): Promise<PlotSize> => {
      try {
        const response = await apiClient.post<PlotSize>("/plotsizes", data);

        if (response.data.success) {
          return response.data.data;
        }
        throw new Error(response.data.message || "Failed to create plot size");
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to create plot size";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      customToast.success("Plot Size created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create plot size");
    },
  });
};

export const useUpdatePlotSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePlotSizeDto;
    }): Promise<PlotSize> => {
      const response = await apiClient.put<PlotSize>(`/plotsizes/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update plot size");
    },
    onSuccess: (_, variables) => {
      customToast.success("Plot Size updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update plot size");
    },
  });
};

export const useDeletePlotSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/plotsizes/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete plot size");
      }
    },
    onSuccess: () => {
      customToast.success("Plot Size deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete plot size");
    },
  });
};

export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: async (
      data: PriceCalculationDto,
    ): Promise<{
      totalArea: number;
      areaUnit: string;
      ratePerUnit: number;
      calculatedPrice: number;
      calculation: string;
    }> => {
      const response = await apiClient.post<any>(
        "/plotsizes/calculate/price",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to calculate price");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to calculate price");
    },
  });
};

export const useConvertArea = () => {
  return useMutation({
    mutationFn: async (
      data: AreaConversionDto,
    ): Promise<{
      original: { value: number; unit: string };
      converted: { value: number; unit: string };
      conversion: string;
    }> => {
      const response = await apiClient.post<any>(
        "/plotsizes/convert/area",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to convert area");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to convert area");
    },
  });
};

export const usePriceBreakdown = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id, "breakdown"],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/plotsizes/${id}/breakdown`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch price breakdown",
      );
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAreaUnits = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "units"],
    queryFn: async () => {
      const response = await apiClient.get<string[]>(
        "/plotsizes/units/available",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch area units");
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours cache
  });
};

export const usePlotSizeStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get<PlotSizeStatistics[]>(
        "/plotsizes/stats/summary",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch statistics");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlotSizesByUnit = (areaUnit: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "by-unit", areaUnit],
    queryFn: async () => {
      const response = await apiClient.get<{
        plotSizes: PlotSize[];
      }>("/plotsizes", {
        params: { areaUnit, limit: 100 },
      });

      if (response.data.success) {
        return response.data.data.plotSizes || [];
      }
      throw new Error(
        response.data.message || "Failed to fetch plot sizes by unit",
      );
    },
    enabled: !!areaUnit,
    staleTime: 5 * 60 * 1000,
  });
};
