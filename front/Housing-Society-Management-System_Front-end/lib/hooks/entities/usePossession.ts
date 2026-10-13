// This file now becomes a wrapper around RTK Query hooks
// Or you can keep the existing TanStack Query implementation and just export the RTK hooks

// Option 1: Use RTK Query hooks directly in components
// Option 2: Create wrapper hooks for consistency

import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreatePossessionDto,
  Possession,
  PossessionQueryParams,
  UpdatePossessionDto,
} from "@/lib/types/possession";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

// TanStack Query implementation (alternative to RTK Query)
export const usePossessions = (params: PossessionQueryParams = {}) => {
  return useQuery({
    queryKey: ["possessions", params],
    queryFn: async () => {
      const response = await apiClient.get<{
        possessions: Possession[];
        pagination: PaginatedResponse<Possession>["pagination"];
        summary: any;
      }>("/possession", { params });

      if (response.data.success) {
        return {
          items: response.data.data.possessions,
          pagination: response.data.data.pagination,
          summary: response.data.data.summary,
        } as PaginatedResponse<Possession> & { summary: any };
      }
      throw new Error(response.data.message || "Failed to fetch possessions");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePossession = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["possession", id],
    queryFn: async () => {
      const response = await apiClient.get<Possession>(`/possession/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch possession");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const possessionsData = queryClient.getQueryData<
        PaginatedResponse<Possession> & { summary: any }
      >(["possessions", {}]);
      return possessionsData?.items.find((p) => p._id === id);
    },
  });
};

export const useCreatePossession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePossessionDto): Promise<Possession> => {
      const response = await apiClient.post<Possession>("/possession", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create possession");
    },
    onSuccess: () => {
      customToast.success("Possession request created successfully");
      queryClient.invalidateQueries({ queryKey: ["possessions"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create possession");
    },
  });
};

export const useUpdatePossession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePossessionDto;
    }): Promise<Possession> => {
      const response = await apiClient.put<Possession>(
        `/possession/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update possession");
    },
    onSuccess: (data, variables) => {
      customToast.success("Possession updated successfully");
      queryClient.invalidateQueries({ queryKey: ["possessions"] });
      queryClient.invalidateQueries({ queryKey: ["possession", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update possession");
    },
  });
};

export const useDeletePossession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/possession/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete possession");
      }
    },
    onSuccess: () => {
      customToast.success("Possession deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["possessions"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete possession");
    },
  });
};

export const useUpdatePossessionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      newStatus: string;
      remarks?: string;
      surveyPerson?: string;
      surveyDate?: Date;
      handoverDate?: Date;
    }): Promise<Possession> => {
      const response = await apiClient.patch<Possession>(
        `/possession/${data.id}/status`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update status");
    },
    onSuccess: (data, variables) => {
      customToast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["possessions"] });
      queryClient.invalidateQueries({ queryKey: ["possession", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update status");
    },
  });
};

export const useUpdateCollectorInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      collectorName: string;
      collectorNic: string;
      isCollected: boolean;
      collectionDate?: Date;
    }): Promise<Possession> => {
      const response = await apiClient.patch<Possession>(
        `/possession/${data.id}/collector`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to update collector info",
      );
    },
    onSuccess: (data, variables) => {
      customToast.success("Collector information updated");
      queryClient.invalidateQueries({ queryKey: ["possessions"] });
      queryClient.invalidateQueries({ queryKey: ["possession", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update collector info");
    },
  });
};

export const usePossessionStatistics = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ["possession-statistics", startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await apiClient.get("/possession/stats/summary", {
        params,
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch statistics");
    },
  });
};
