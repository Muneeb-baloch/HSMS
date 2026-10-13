// lib/hooks/entities/useMarketplace.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "marketplace";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useListings = (params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "listings", queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.category) queryParams.category = params.category;
      if (params.minPrice) queryParams.minPrice = params.minPrice;
      if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
      if (params.condition) queryParams.condition = params.condition;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get("/marketplace", { params: queryParams });
      if (response.data.success) {
        return {
          items: Array.isArray(response.data.data) ? response.data.data : response.data.data.listings ?? [],
          pagination: response.data.pagination ?? response.data.data?.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch listings");
    },
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "listing", id],
    queryFn: async () => {
      const response = await apiClient.get(`/marketplace/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch listing");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/marketplace", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create listing");
    },
    onSuccess: () => {
      customToast.success("Listing created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create listing");
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`/marketplace/${id}`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update listing");
    },
    onSuccess: (_, variables) => {
      customToast.success("Listing updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "listing", variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update listing");
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/marketplace/${id}`);
      if (!response.data.success) throw new Error(response.data.message || "Failed to delete listing");
    },
    onSuccess: () => {
      customToast.success("Listing deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete listing");
    },
  });
};

export const useMarkAsSold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/marketplace/${id}/sold`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to mark as sold");
    },
    onSuccess: (_, id) => {
      customToast.success("Listing marked as sold");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "listing", id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to mark as sold");
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/marketplace/${id}/favorite`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to toggle favorite");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "favorites"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle favorite");
    },
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "my-listings"],
    queryFn: async () => {
      const response = await apiClient.get("/marketplace/my-listings");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch my listings");
    },
  });
};

export const useMyFavorites = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "favorites"],
    queryFn: async () => {
      const response = await apiClient.get("/marketplace/my-favorites");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch favorites");
    },
  });
};

export const usePopularListings = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "popular", societyId],
    queryFn: async () => {
      const response = await apiClient.get("/marketplace/popular");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch popular listings");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategoryStats = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "category-stats", societyId],
    queryFn: async () => {
      const response = await apiClient.get("/marketplace/stats");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch category stats");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};
