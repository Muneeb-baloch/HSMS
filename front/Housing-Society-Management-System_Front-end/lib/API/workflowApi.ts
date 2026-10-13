// lib/API/workflowApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  Workflow,
  WorkflowInstance,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowQueryParams,
} from "@/lib/types/workflow";

const BASE = "/workflows";

export const workflowApi = {
  getAll: (params: WorkflowQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search) queryParams.search = params.search;
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.triggerEntity)
      queryParams.triggerEntity = params.triggerEntity;
    if (params.isActive !== undefined)
      queryParams.isActive = params.isActive;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    return apiClient.get<{
      workflows: Workflow[];
      pagination: PaginatedResponse<Workflow>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getById: (id: string) => apiClient.get<Workflow>(`${BASE}/${id}`),

  create: (data: CreateWorkflowDto) =>
    apiClient.post<Workflow>(BASE, data),

  update: (id: string, data: UpdateWorkflowDto) =>
    apiClient.put<Workflow>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  // Workflow Instances
  getInstances: (
    workflowId: string,
    params: { page?: number; limit?: number; status?: string } = {}
  ) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.status) queryParams.status = params.status;

    return apiClient.get<{
      instances: WorkflowInstance[];
      pagination: PaginatedResponse<WorkflowInstance>["pagination"];
    }>(`${BASE}/${workflowId}/instances`, { params: queryParams });
  },

  createInstance: (data: {
    workflowId: string;
    entityType: string;
    entityId: string;
    societyId: string;
  }) => apiClient.post<WorkflowInstance>(`${BASE}/instances`, data),

  getInstance: (instanceId: string) =>
    apiClient.get<WorkflowInstance>(`${BASE}/instances/${instanceId}`),

  approveStep: (instanceId: string, data: { notes?: string } = {}) =>
    apiClient.patch<WorkflowInstance>(
      `${BASE}/instances/${instanceId}/approve`,
      data
    ),

  rejectStep: (instanceId: string, data: { notes?: string } = {}) =>
    apiClient.patch<WorkflowInstance>(
      `${BASE}/instances/${instanceId}/reject`,
      data
    ),
};
