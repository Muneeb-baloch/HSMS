// lib/hooks/entities/useFacility.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateFacilityDto,
  Facility,
  FacilityQueryParams,
  UpdateFacilityDto,
} from "@/lib/types/facility";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "facilities";

export const useFacilities = (params: FacilityQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};

      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 10;

      if (params.search) queryParams.search = params.search;
      if (params.facilityType) queryParams.facilityType = params.facilityType;
      if (params.isActive !== undefined) queryParams.isActive = params.isActive;

      const response = await apiClient.get<{
        facilities: Facility[];
        pagination: PaginatedResponse<Facility>["pagination"];
      }>("/facilities", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.facilities,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch facilities");
    },
  });
};

export const useFacility = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Facility>(`/facilities/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch facility");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const facilitiesData = queryClient.getQueryData<any>([QUERY_KEY, {}]);
      return facilitiesData?.items?.find((f: Facility) => f._id === id);
    },
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFacilityDto): Promise<Facility> => {
      const response = await apiClient.post<Facility>("/facilities", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create facility");
    },
    onSuccess: () => {
      customToast.success("Facility created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create facility");
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFacilityDto;
    }): Promise<Facility> => {
      const response = await apiClient.put<Facility>(
        `/facilities/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update facility");
    },
    onSuccess: (_, variables) => {
      customToast.success("Facility updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update facility");
    },
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/facilities/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete facility");
      }
    },
    onSuccess: () => {
      customToast.success("Facility deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete facility");
    },
  });
};

export const useToggleFacilityStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Facility> => {
      const response = await apiClient.patch<Facility>(
        `/facilities/${id}/toggle-status`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to toggle status");
    },
    onSuccess: (_, id) => {
      customToast.success("Facility status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle facility status");
    },
  });
};
