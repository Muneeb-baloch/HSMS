// src/lib/hooks/entities/useCity.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";
import {
  City,
  CreateCityDto,
  UpdateCityDto,
  CityQueryParams,
} from "@/lib/types/city";
import { PaginatedResponse } from "@/lib/types/api";
import { apiClient } from "@/lib/API/client";

// Reuse the same pattern as useMember.ts
export const useCities = (params: CityQueryParams = {}) => {
  return useQuery({
    queryKey: ["cities", params],
    queryFn: async () => {
      const response = await apiClient.get<{
        cities: City[];
        pagination: PaginatedResponse<City>["pagination"];
      }>("/cities", { params });

      if (response.data.success) {
        return {
          items: response.data.data.cities,
          pagination: response.data.data.pagination,
        } as PaginatedResponse<City>;
      }
      throw new Error(response.data.message || "Failed to fetch cities");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCity = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["city", id],
    queryFn: async () => {
      const response = await apiClient.get<City>(`/cities/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch city");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const citiesData = queryClient.getQueryData<PaginatedResponse<City>>([
        "cities",
        {},
      ]);
      return citiesData?.items.find((c) => c._id === id);
    },
  });
};

export const useCreateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCityDto): Promise<City> => {
      const response = await apiClient.post<City>("/cities", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create city");
    },
    onSuccess: () => {
      customToast.success("City created successfully");
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create city");
    },
  });
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCityDto;
    }): Promise<City> => {
      const response = await apiClient.put<City>(`/cities/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update city");
    },
    onSuccess: () => {
      customToast.success("City updated successfully");
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update city");
    },
  });
};

/** Fetch cities for a specific state (cascading dropdown) */
export const useCitiesByState = (stateId: string | null | undefined) => {
  return useQuery({
    queryKey: ["cities", "byState", stateId],
    queryFn: async () => {
      if (!stateId) return [];
      const response = await apiClient.get<{ success: boolean; data: { _id: string; cityName: string }[] }>(
        `/cities/state/${stateId}`
      );
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
    enabled: !!stateId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/cities/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete city");
      }
    },
    onSuccess: () => {
      customToast.success("City deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete city");
    },
  });
};
