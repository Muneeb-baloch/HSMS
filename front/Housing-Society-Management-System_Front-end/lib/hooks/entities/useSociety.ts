// lib/hooks/entities/useSociety.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateSocietyDto,
  Society,
  SocietyQueryParams,
  SocietyStats,
  UpdateSocietyDto,
} from "@/lib/types/society";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "societies";

export const useSocieties = (params: SocietyQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};

      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 10;

      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.search) queryParams.search = params.search;
      if (params.subscriptionStatus)
        queryParams.subscriptionStatus = params.subscriptionStatus;
      if (params.isActive !== undefined) queryParams.isActive = params.isActive;

      const response = await apiClient.get<{
        societies: Society[];
        pagination: PaginatedResponse<Society>["pagination"];
      }>("/societies", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.societies,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch societies");
    },
  });
};

export const useSociety = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Society>(`/societies/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch society");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const societiesData = queryClient.getQueryData<any>([QUERY_KEY, {}]);
      return societiesData?.items?.find((s: Society) => s._id === id);
    },
  });
};

export const useCreateSociety = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSocietyDto): Promise<Society> => {
      const response = await apiClient.post<Society>("/societies", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create society");
    },
    onSuccess: () => {
      customToast.success("Society created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create society");
    },
  });
};

export const useUpdateSociety = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSocietyDto;
    }): Promise<Society> => {
      const response = await apiClient.put<Society>(`/societies/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update society");
    },
    onSuccess: (_, variables) => {
      customToast.success("Society updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update society");
    },
  });
};

export const useDeleteSociety = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/societies/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete society");
      }
    },
    onSuccess: () => {
      customToast.success("Society deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete society");
    },
  });
};

export const useSocietyStats = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id, "stats"],
    queryFn: async () => {
      const response = await apiClient.get<SocietyStats>(
        `/societies/${id}/stats`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch society statistics",
      );
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useToggleSocietyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Society> => {
      const response = await apiClient.patch<Society>(
        `/societies/${id}/toggle-status`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to toggle status");
    },
    onSuccess: (_, id) => {
      customToast.success("Society status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle society status");
    },
  });
};

export const useSocietyLimits = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id, "limits"],
    queryFn: async () => {
      const response = await apiClient.get<{
        withinLimits: boolean;
        usage: Record<string, { current: number; max: number }>;
      }>(`/societies/${id}/limits`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to check society limits",
      );
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
