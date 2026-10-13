// src/lib/hooks/entities/usePlot.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreatePlotDto,
  Plot,
  PlotAssignmentDto,
  PlotQueryParams,
  PlotStatistics,
  PlotType,
  UpdatePlotDto,
} from "@/lib/types/plot";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

// In usePlot.ts, ensure plots have default values
export const usePlots = (params: PlotQueryParams = {}) => {
  return useQuery({
    queryKey: ["plots", params],
    queryFn: async () => {
      const response = await apiClient.get<{
        plots: Plot[];
        pagination: PaginatedResponse<Plot>["pagination"];
        summary: any;
      }>("/plots", { params });

      if (response.data.success) {
        // Add isAvailable property and ensure all fields exist
        const plotsWithAvailability = response.data.data.plots.map((plot) => ({
          ...plot,
          plotNo: plot.plotNo || "",
          plotType: plot.plotType || PlotType.STANDARD,
          plotArea: plot.plotArea || 0,
          plotBasePrice: plot.plotBasePrice || 0,
          surchargeAmount: plot.surchargeAmount || 0,
          discountAmount: plot.discountAmount || 0,
          plotTotalAmount: plot.plotTotalAmount || 0,
          isAvailable: !plot.fileId,
        }));

        return {
          items: plotsWithAvailability,
          pagination: response.data.data.pagination,
          summary: response.data.data.summary,
        } as PaginatedResponse<Plot> & { summary: any };
      }
      throw new Error(response.data.message || "Failed to fetch plots");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlot = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["plot", id],
    queryFn: async () => {
      const response = await apiClient.get<Plot>(`/plots/${id}`);

      if (response.data.success) {
        const plot = response.data.data;
        return {
          ...plot,
          isAvailable: !plot.fileId,
        };
      }
      throw new Error(response.data.message || "Failed to fetch plot");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const plotsData = queryClient.getQueryData<
        PaginatedResponse<Plot> & { summary: any }
      >(["plots", {}]);
      const plot = plotsData?.items.find((p) => p._id === id);
      if (plot) {
        return {
          ...plot,
          isAvailable: !plot.fileId,
        };
      }
      return undefined;
    },
  });
};

export const useCreatePlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlotDto): Promise<Plot> => {
      const response = await apiClient.post<Plot>("/plots", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create plot");
    },
    onSuccess: () => {
      customToast.success("Plot created successfully");
      queryClient.invalidateQueries({ queryKey: ["plots"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create plot");
    },
  });
};

export const useUpdatePlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePlotDto;
    }): Promise<Plot> => {
      const response = await apiClient.put<Plot>(`/plots/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update plot");
    },
    onSuccess: (data, variables) => {
      customToast.success("Plot updated successfully");
      queryClient.invalidateQueries({ queryKey: ["plots"] });
      queryClient.invalidateQueries({ queryKey: ["plot", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update plot");
    },
  });
};

export const useDeletePlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/plots/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete plot");
      }
    },
    onSuccess: () => {
      customToast.success("Plot deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["plots"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete plot");
    },
  });
};

export const useAssignPlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PlotAssignmentDto): Promise<Plot> => {
      const response = await apiClient.post<Plot>("/plots/assign", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to assign plot");
    },
    onSuccess: () => {
      customToast.success("Plot assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["plots"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to assign plot");
    },
  });
};

export const useUnassignPlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Plot> => {
      const response = await apiClient.post<Plot>(`/plots/${id}/unassign`, {});

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to unassign plot");
    },
    onSuccess: (data, variables) => {
      customToast.success("Plot unassigned successfully");
      queryClient.invalidateQueries({ queryKey: ["plots"] });
      queryClient.invalidateQueries({ queryKey: ["plot", variables] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to unassign plot");
    },
  });
};

export const useMarkPossessionReady = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Plot> => {
      const response = await apiClient.post<Plot>(
        `/plots/${id}/possession-ready`,
        {},
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to mark plot as possession ready",
      );
    },
    onSuccess: (data, variables) => {
      customToast.success("Plot marked as possession ready");
      queryClient.invalidateQueries({ queryKey: ["plots"] });
      queryClient.invalidateQueries({ queryKey: ["plot", variables] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to mark plot as possession ready");
    },
  });
};

export const usePlotStatistics = (projectId?: string) => {
  return useQuery({
    queryKey: ["plot-statistics", projectId],
    queryFn: async () => {
      const params: any = {};
      if (projectId) params.projectId = projectId;

      const response = await apiClient.get<PlotStatistics>(
        "/plots/stats/summary",
        { params },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch plot statistics",
      );
    },
  });
};

export const useAvailablePlots = (projectId?: string, blockId?: string) => {
  return useQuery({
    queryKey: ["available-plots", projectId, blockId],
    queryFn: async () => {
      const params: any = {};
      if (projectId) params.projectId = projectId;
      if (blockId) params.blockId = blockId;

      const response = await apiClient.get<Plot[]>("/plots/available", {
        params,
      });

      if (response.data.success) {
        return response.data.data.map((plot) => ({
          ...plot,
          isAvailable: true,
        }));
      }
      throw new Error(
        response.data.message || "Failed to fetch available plots",
      );
    },
  });
};

export const usePlotPriceCalculation = () => {
  return useMutation({
    mutationFn: async (data: {
      plotSizeId: string;
      plotCategoryId: string;
      plotType: string;
      plotLength: number;
      plotWidth: number;
      discountAmount?: number;
    }): Promise<any> => {
      const response = await apiClient.post("/plots/calculate-price", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to calculate plot price",
      );
    },
  });
};

export const useBulkUpdatePlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      plotIds: string[];
      field: string;
      value: any;
    }): Promise<{ matched: number; modified: number; errors: string[] }> => {
      const response = await apiClient.post("/plots/bulk-update", data);

      if (response.data.success) {
        return response.data.data as unknown as {
          matched: number;
          modified: number;
          errors: string[];
        };
      }
      throw new Error(response.data.message || "Failed to bulk update plots");
    },
    onSuccess: () => {
      customToast.success("Plots updated successfully");
      queryClient.invalidateQueries({ queryKey: ["plots"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to bulk update plots");
    },
  });
};
