import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreatePlotBlockDto,
  PlotBlock,
  PlotBlockQueryParams,
  UpdatePlotBlockDto,
} from "@/lib/types/plotblock";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

export const usePlotBlocks = (params: PlotBlockQueryParams = {}) => {
  return useQuery({
    queryKey: ["plotBlocks", params],
    queryFn: async () => {
      const response = await apiClient.get<{
        plotBlocks: PlotBlock[];
        pagination: PaginatedResponse<PlotBlock>["pagination"];
      }>("/plotblocks", { params });

      if (response.data.success) {
        return {
          items: response.data.data.plotBlocks,
          pagination: response.data.data.pagination,
        } as PaginatedResponse<PlotBlock>;
      }
      throw new Error(response.data.message || "Failed to fetch plot blocks");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlotBlock = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["plotBlock", id],
    queryFn: async () => {
      const response = await apiClient.get<PlotBlock>(`/plotblocks/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch plot block");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const plotBlocksData = queryClient.getQueryData<
        PaginatedResponse<PlotBlock>
      >(["plotBlocks", {}]);
      return plotBlocksData?.items.find((p) => p._id === id);
    },
  });
};

export const useCreatePlotBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlotBlockDto): Promise<PlotBlock> => {
      try {
        const response = await apiClient.post<PlotBlock>("/plotblocks", data);

        if (response.data.success) {
          return response.data.data;
        }
        throw new Error(response.data.message || "Failed to create plot block");
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to create plot block";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      customToast.success("Plot Block created successfully");
      queryClient.invalidateQueries({ queryKey: ["plotBlocks"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create plot block");
    },
  });
};

export const useUpdatePlotBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePlotBlockDto;
    }): Promise<PlotBlock> => {
      const response = await apiClient.put<PlotBlock>(
        `/plotblocks/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update plot block");
    },
    onSuccess: () => {
      customToast.success("Plot Block updated successfully");
      queryClient.invalidateQueries({ queryKey: ["plotBlocks"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update plot block");
    },
  });
};

export const useDeletePlotBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/plotblocks/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete plot block");
      }
    },
    onSuccess: () => {
      customToast.success("Plot Block deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["plotBlocks"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete plot block");
    },
  });
};

export interface AreaSummary {
  areaUnit: string;
  area: number;
  allocated: number;
  remaining: number;
}

/** Live "area remaining" for a plot block - used by the Plot create/edit form. */
export const useBlockAreaSummary = (blockId: string | undefined) => {
  return useQuery({
    queryKey: ["plotBlock", blockId, "area-summary"],
    queryFn: async () => {
      const response = await apiClient.get<AreaSummary>(
        `/plotblocks/${blockId}/area-summary`,
      );
      if (response.data.success) {
        return response.data.data as AreaSummary;
      }
      throw new Error(response.data.message || "Failed to fetch area summary");
    },
    enabled: !!blockId,
    staleTime: 0,
  });
};
