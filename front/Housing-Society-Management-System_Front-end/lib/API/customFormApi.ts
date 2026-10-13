// lib/API/customFormApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CustomFormField,
  CreateCustomFormFieldDto,
  UpdateCustomFormFieldDto,
  CustomFormQueryParams,
} from "@/lib/types/custom-form";

const BASE = "/custom-forms";

export const customFormApi = {
  getAll: (params: CustomFormQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.entityType) queryParams.entityType = params.entityType;
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.fieldType) queryParams.fieldType = params.fieldType;
    if (params.isActive !== undefined)
      queryParams.isActive = params.isActive;
    if (params.search) queryParams.search = params.search;

    return apiClient.get<{
      fields: CustomFormField[];
      pagination: PaginatedResponse<CustomFormField>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getById: (id: string) =>
    apiClient.get<CustomFormField>(`${BASE}/${id}`),

  getByEntity: (societyId: string, entityType: string) =>
    apiClient.get<CustomFormField[]>(
      `${BASE}/society/${societyId}/entity/${entityType}`
    ),

  create: (data: CreateCustomFormFieldDto) =>
    apiClient.post<CustomFormField>(BASE, data),

  update: (id: string, data: UpdateCustomFormFieldDto) =>
    apiClient.put<CustomFormField>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  reorder: (data: { societyId: string; entityType: string; fieldOrder: { fieldId: string; order: number }[] }) =>
    apiClient.patch(`${BASE}/reorder`, data),

  validate: (data: { entityType: string; societyId: string; values: Record<string, unknown> }) =>
    apiClient.post<{ valid: boolean; errors?: Record<string, string> }>(
      `${BASE}/validate`,
      data
    ),

  getEntityTypes: (societyId: string) =>
    apiClient.get<string[]>(`${BASE}/entity-types/${societyId}`),
};
