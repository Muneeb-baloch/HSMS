// src/lib/hooks/entities/useState.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";
import {
  State,
  CreateStateDto,
  UpdateStateDto,
  StateQueryParams,
} from "@/lib/types/state";
import { PaginatedResponse } from "@/lib/types/api";
import { apiClient } from "@/lib/API/client";

/** Fetch all states for dropdown (no pagination) */
export const useAllStates = () => {
  return useQuery({
    queryKey: ["states", "all"],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: State[] }>("/states/all");
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useStates = (params: StateQueryParams = {}) => {
  return useQuery({
    queryKey: ["states", params],
    queryFn: async () => {
      const response = await apiClient.get<{
        states: State[];
        pagination: PaginatedResponse<State>["pagination"];
      }>("/states", { params });

      if (response.data.success) {
        return {
          items: response.data.data.states,
          pagination: response.data.data.pagination,
        } as PaginatedResponse<State>;
      }
      throw new Error(response.data.message || "Failed to fetch states");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useState = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["state", id],
    queryFn: async () => {
      const response = await apiClient.get<State>(`/states/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch state");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const statesData = queryClient.getQueryData<PaginatedResponse<State>>([
        "states",
        {},
      ]);
      return statesData?.items.find((s) => s._id === id);
    },
  });
};

export const useCreateState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStateDto): Promise<State> => {
      const response = await apiClient.post<State>("/states", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create state");
    },
    onSuccess: () => {
      customToast.success("State created successfully");
      queryClient.invalidateQueries({ queryKey: ["states"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create state");
    },
  });
};

export const useUpdateState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStateDto;
    }): Promise<State> => {
      const response = await apiClient.put<State>(`/states/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update state");
    },
    onSuccess: () => {
      customToast.success("State updated successfully");
      queryClient.invalidateQueries({ queryKey: ["states"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update state");
    },
  });
};

export const useDeleteState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/states/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete state");
      }
    },
    onSuccess: () => {
      customToast.success("State deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["states"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete state");
    },
  });
};
