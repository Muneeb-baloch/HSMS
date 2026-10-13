// src/lib/hooks/entities/useInstallmentPlan.ts
import { apiClient } from '@/lib/API/client';
import { PaginatedResponse } from '@/lib/types/api';
import {
  CreateInstallmentPlanDto,
  InstallmentPlan,
  InstallmentPlanDashboardSummary,
  InstallmentPlanQueryParams,
  UpdateInstallmentPlanDto,
} from '@/lib/types/installmentPlan';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = 'installment-plans';

export const useInstallmentPlans = (params: InstallmentPlanQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, unknown> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };
      if (params.projectId) queryParams.projectId = params.projectId;
      if (params.search) queryParams.search = params.search;
      if (params.isActive !== undefined) queryParams.isActive = params.isActive;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<{
        plans: InstallmentPlan[];
        pagination: PaginatedResponse<InstallmentPlan>['pagination'];
      }>('/installment-plans', { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.plans,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || 'Failed to fetch installment plans');
    },
  });
};

export const useInstallmentPlan = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentPlan>(`/installment-plans/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || 'Failed to fetch installment plan');
    },
    enabled: !!id,
  });
};

export const useCreateInstallmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInstallmentPlanDto): Promise<InstallmentPlan> => {
      const response = await apiClient.post<InstallmentPlan>('/installment-plans', data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || 'Failed to create installment plan');
    },
    onSuccess: () => {
      customToast.success('Installment plan created successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to create installment plan');
    },
  });
};

export const useUpdateInstallmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInstallmentPlanDto;
    }): Promise<InstallmentPlan> => {
      const response = await apiClient.put<InstallmentPlan>(
        `/installment-plans/${id}`,
        data
      );
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || 'Failed to update installment plan');
    },
    onSuccess: (_, variables) => {
      customToast.success('Installment plan updated successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to update installment plan');
    },
  });
};

export const useInstallmentPlanDashboardSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentPlanDashboardSummary>(
        '/installment-plans/dashboard-summary'
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || 'Failed to fetch dashboard summary'
      );
    },
  });
};

export const useSearchInstallmentPlans = (q: string, limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'search', q, limit],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentPlan[]>(
        '/installment-plans/search',
        { params: { q, limit } }
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || 'Failed to search installment plans'
      );
    },
    enabled: !!q && q.trim().length >= 2,
  });
};

export const useInstallmentPlansByProject = (projId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'by-project', projId],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentPlan[]>(
        `/installment-plans/by-project/${projId}`
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || 'Failed to fetch plans by project'
      );
    },
    enabled: !!projId,
  });
};

export const useDeleteInstallmentPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/installment-plans/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete installment plan');
      }
    },
    onSuccess: () => {
      customToast.success('Installment plan deleted successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to delete installment plan');
    },
  });
};
