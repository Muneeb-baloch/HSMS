// lib/API/parkingApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  ParkingSpot,
  ParkingPass,
  CreateSpotDto,
  CreatePassDto,
  SpotQueryParams,
  PassQueryParams,
  ParkingStats,
} from "@/lib/types/parking";

const BASE = "/parking";

export const parkingApi = {
  // Spots
  getSpots: (params: SpotQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.spotType) queryParams.spotType = params.spotType;
    if (params.isOccupied !== undefined)
      queryParams.isOccupied = params.isOccupied;
    if (params.status) queryParams.status = params.status;

    return apiClient.get<{
      items: ParkingSpot[];
      pagination: PaginatedResponse<ParkingSpot>["pagination"];
    }>(`${BASE}/spots`, { params: queryParams });
  },

  getSpotById: (id: string) =>
    apiClient.get<ParkingSpot>(`${BASE}/spots/${id}`),

  createSpot: (data: CreateSpotDto) =>
    apiClient.post<ParkingSpot>(`${BASE}/spots`, data),

  updateSpot: (id: string, data: Partial<CreateSpotDto>) =>
    apiClient.put<ParkingSpot>(`${BASE}/spots/${id}`, data),

  deleteSpot: (id: string) => apiClient.delete(`${BASE}/spots/${id}`),

  assignSpot: (id: string, memberId: string, vehicleNumber: string) =>
    apiClient.patch<ParkingSpot>(`${BASE}/spots/${id}/assign`, {
      memberId,
      vehicleNumber,
    }),

  unassignSpot: (id: string) =>
    apiClient.patch<ParkingSpot>(`${BASE}/spots/${id}/unassign`, {}),

  toggleRent: (id: string, price?: number) =>
    apiClient.patch<ParkingSpot>(`${BASE}/spots/${id}/toggle-rent`, {
      rentPrice: price,
    }),

  // Passes
  getPasses: (params: PassQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.status) queryParams.status = params.status;
    if (params.purpose) queryParams.purpose = params.purpose;

    return apiClient.get<{
      items: ParkingPass[];
      pagination: PaginatedResponse<ParkingPass>["pagination"];
    }>(`${BASE}/passes`, { params: queryParams });
  },

  getPassById: (id: string) =>
    apiClient.get<ParkingPass>(`${BASE}/passes/${id}`),

  issuePass: (data: CreatePassDto) =>
    apiClient.post<ParkingPass>(`${BASE}/passes`, data),

  verifyPass: (code: string) =>
    apiClient.get<ParkingPass>(`${BASE}/passes/verify/${code}`),

  cancelPass: (id: string) =>
    apiClient.patch<ParkingPass>(`${BASE}/passes/${id}/cancel`, {}),

  // Stats
  getStats: (societyId: string) =>
    apiClient.get<ParkingStats>(`${BASE}/stats/${societyId}`),
};
