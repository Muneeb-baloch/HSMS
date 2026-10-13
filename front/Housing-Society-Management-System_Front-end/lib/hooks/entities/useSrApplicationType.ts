// src/lib/hooks/entities/useSrApplicationType.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateSrApplicationTypeDto,
  SrApplicationType,
  SrApplicationTypeQueryParams,
  UpdateSrApplicationTypeDto,
} from "@/lib/types/srApplicationType";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "srApplicationTypes";

export const useSrApplicationTypes = (params: SrApplicationTypeQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, any> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };

      if (params.search) queryParams.search = params.search;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<{
        srApplicationTypes: SrApplicationType[];
        pagination: PaginatedResponse<SrApplicationType>["pagination"];
      }>("/applicationtype", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.srApplicationTypes,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch SR application types");
    },
  });
};

export const useAllSrApplicationTypes = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "all"],
    queryFn: async () => {
      const response = await apiClient.get<SrApplicationType[]>("/applicationtype/all");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch all SR application types");
    },
  });
};

export const useSrApplicationType = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<SrApplicationType>(`/applicationtype/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch SR application type");
    },
    enabled: !!id,
  });
};

export const useCreateSrApplicationType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSrApplicationTypeDto): Promise<SrApplicationType> => {
      const response = await apiClient.post<SrApplicationType>("/applicationtype", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create SR application type");
    },
    onSuccess: () => {
      customToast.success("SR application type created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create SR application type");
    },
  });
};

export const useUpdateSrApplicationType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSrApplicationTypeDto;
    }): Promise<SrApplicationType> => {
      const response = await apiClient.put<SrApplicationType>(`/applicationtype/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update SR application type");
    },
    onSuccess: (data) => {
      customToast.success("SR application type updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update SR application type");
    },
  });
};

export const useDeleteSrApplicationType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/applicationtype/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete SR application type");
      }
    },
    onSuccess: () => {
      customToast.success("SR application type deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete SR application type");
    },
  });
};

// Hook for dropdown usage
export const useSrApplicationTypesDropdown = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "dropdown"],
    queryFn: async () => {
      const response = await apiClient.get<SrApplicationType[]>("/applicationtype/all");

      if (response.data.success) {
        return response.data.data.map(type => ({
          value: type._id,
          label: `${type.applicationName} (Rs. ${type.applicationFee})`,
          applicationFee: type.applicationFee,
        }));
      }
      throw new Error(response.data.message || "Failed to fetch SR application types for dropdown");
    },
  });
};
