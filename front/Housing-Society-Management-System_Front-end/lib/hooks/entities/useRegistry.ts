// src/lib/hooks/entities/useRegistry.ts
import { registryApi } from "@/lib/API/registryApi";
import {
  Registry,
  RegistryQueryParams,
  CreateRegistryDto,
  UpdateRegistryDto,
  VerifyRegistryDto,
} from "@/lib/types/registry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "registries";

export const useRegistries = (params: RegistryQueryParams & { search?: string } = {}) => {
  const queryKeyString = JSON.stringify(params);
  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const response = await registryApi.getRegistries(params);
      if (response.data.success) {
        return {
          items: response.data.data.registries,
          pagination: response.data.data.pagination,
          summary: response.data.data.summary,
        };
      }
      throw new Error(response.data.message || "Failed to fetch registries");
    },
  });
};

export const useRegistry = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await registryApi.getRegistry(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch registry");
    },
    enabled: !!id,
  });
};

export const usePendingVerifications = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [QUERY_KEY, "pending", page, limit],
    queryFn: async () => {
      const response = await registryApi.getPendingVerifications(page, limit);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch pending verifications");
    },
  });
};

export const useCreateRegistry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRegistryDto): Promise<Registry> => {
      const response = await registryApi.create(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create registry");
    },
    onSuccess: () => {
      customToast.success("Registry created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create registry");
    },
  });
};

export const useUpdateRegistry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRegistryDto;
    }): Promise<Registry> => {
      const response = await registryApi.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update registry");
    },
    onSuccess: (data) => {
      customToast.success("Registry updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update registry");
    },
  });
};

export const useVerifyRegistry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: VerifyRegistryDto;
    }): Promise<Registry> => {
      const response = await registryApi.verify(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to verify registry");
    },
    onSuccess: (data) => {
      customToast.success("Registry verification updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to verify registry");
    },
  });
};

export const useDeleteRegistry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await registryApi.delete(id);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete registry");
      }
    },
    onSuccess: () => {
      customToast.success("Registry deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete registry");
    },
  });
};
