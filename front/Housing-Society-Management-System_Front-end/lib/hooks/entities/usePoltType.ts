// src/lib/hooks/entities/usePlotType.ts
"use client";

import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreatePlotTypeDto,
  PlotTypeQueryParams,
  PlotTypes,
  UpdatePlotTypeDto,
} from "@/lib/types/plottypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

export const usePlotTypes = (params: PlotTypeQueryParams = {}) => {
  return useQuery({
    queryKey: ["plotTypes", params],
    queryFn: async () => {
      const response = await apiClient.get<{
        plotTypes: PlotTypes[];
        pagination: PaginatedResponse<PlotTypes>["pagination"];
      }>("/plottypes", { params });

      if (response.data.success) {
        return {
          items: response.data.data.plotTypes,
          pagination: response.data.data.pagination,
        } as PaginatedResponse<PlotTypes>;
      }
      throw new Error(response.data.message || "Failed to fetch plot types");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlotType = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["plotType", id],
    queryFn: async () => {
      const response = await apiClient.get<PlotTypes>(`/plottypes/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch plot type");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const plotTypesData = queryClient.getQueryData<
        PaginatedResponse<PlotTypes>
      >(["plotTypes", {}]);
      return plotTypesData?.items.find((p) => p._id === id);
    },
  });
};

export const useCreatePlotType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlotTypeDto): Promise<PlotTypes> => {
      const response = await apiClient.post<PlotTypes>("/plottypes", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create plot type");
    },
    onSuccess: () => {
      customToast.success("Plot Type created successfully");
      queryClient.invalidateQueries({ queryKey: ["plotTypes"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create plot type");
    },
  });
};

export const useUpdatePlotType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePlotTypeDto;
    }): Promise<PlotTypes> => {
      const response = await apiClient.put<PlotTypes>(`/plottypes/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update plot type");
    },
    onSuccess: () => {
      customToast.success("Plot Type updated successfully");
      queryClient.invalidateQueries({ queryKey: ["plotTypes"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update plot type");
    },
  });
};

export const useDeletePlotType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/plottypes/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete plot type");
      }
    },
    onSuccess: () => {
      customToast.success("Plot Type deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["plotTypes"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete plot type");
    },
  });
};

export const useAllPlotTypes = () => {
  return useQuery({
    queryKey: ["allPlotTypes"],
    queryFn: async (): Promise<PlotTypes[]> => {
      const response = await apiClient.get<PlotTypes[]>("/plottypes/all");
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch all plot types",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};
