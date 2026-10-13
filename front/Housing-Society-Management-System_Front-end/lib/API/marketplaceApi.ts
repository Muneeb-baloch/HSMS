// lib/API/marketplaceApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  Listing,
  CreateListingDto,
  UpdateListingDto,
  ListingQueryParams,
} from "@/lib/types/marketplace";

const BASE = "/marketplace";

export const marketplaceApi = {
  getListings: (params: ListingQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.category) queryParams.category = params.category;
    if (params.listingType) queryParams.listingType = params.listingType;
    if (params.condition) queryParams.condition = params.condition;
    if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
    if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
    if (params.search) queryParams.search = params.search;
    if (params.status) queryParams.status = params.status;

    return apiClient.get<{
      items: Listing[];
      pagination: PaginatedResponse<Listing>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getListingById: (id: string) =>
    apiClient.get<Listing>(`${BASE}/${id}`),

  createListing: (data: CreateListingDto) =>
    apiClient.post<Listing>(BASE, data),

  updateListing: (id: string, data: UpdateListingDto) =>
    apiClient.put<Listing>(`${BASE}/${id}`, data),

  deleteListing: (id: string) => apiClient.delete(`${BASE}/${id}`),

  markAsSold: (id: string) =>
    apiClient.patch<Listing>(`${BASE}/${id}/sold`, {}),

  toggleFavorite: (id: string) =>
    apiClient.post<{ isFavorited: boolean }>(`${BASE}/${id}/favorite`, {}),

  getMyListings: () =>
    apiClient.get<Listing[]>(`${BASE}/my-listings`),

  getMyFavorites: () =>
    apiClient.get<Listing[]>(`${BASE}/my-favorites`),

  getPopularListings: (societyId: string) =>
    apiClient.get<Listing[]>(`${BASE}/popular/${societyId}`),

  getCategoryStats: (societyId: string) =>
    apiClient.get<Record<string, number>>(`${BASE}/category-stats/${societyId}`),
};
