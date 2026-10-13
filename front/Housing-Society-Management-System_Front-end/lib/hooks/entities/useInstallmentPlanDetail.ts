import { apiClient } from '@/lib/API/client';
import { PaginatedResponse } from '@/lib/types/api';
import {
  CreateInstallmentPlanDetailDto,
  InstallmentPlanDetail,
  InstallmentPlanDetailQueryParams,
  InstallmentPlanDetailSummary,
  UpdateInstallmentPlanDetailDto,
} from '@/lib/types/installmentPlanDetail';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = 'installment-plan-details';

export const useInstallmentPlanDetails = (
  params: InstallmentPlanDetailQueryParams = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, unknown> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };
      if (params.planId) queryParams.planId = params.planId;
      if (params.instCatId) queryParams.instCatId = params.instCatId;
      if (params.occurrence != null) queryParams.occurrence = params.occurrence;
      if (params.search) queryParams.search = params.search;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<{
        details: InstallmentPlanDetail[];
        pagination: PaginatedResponse<InstallmentPlanDetail>['pagination'];
      }>('/installment-plan-details', { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.details,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || 'Failed to fetch plan details'
      );
    },
  });
};

export const useInstallmentPlanDetail = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentPlanDetail>(
        `/installment-plan-details/${id}`
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || 'Failed to fetch plan detail'
      );
    },
    enabled: !!id,
  });
};

export const useInstallmentPlanDetailsByPlan = (planId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'plan', planId],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentPlanDetail[]>(
        `/installment-plan-details/plan/${planId}`
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || 'Failed to fetch plan details'
      );
    },
    enabled: !!planId,
  });
};

export const useInstallmentPlanDetailsByCategory = (instCatId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'category', instCatId],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentPlanDetail[]>(
        `/installment-plan-details/category/${instCatId}`
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || 'Failed to fetch plan details'
      );
    },
    enabled: !!instCatId,
  });
};

export const useInstallmentPlanDetailSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'summary'],
    queryFn: async () => {
      const response = await apiClient.get<InstallmentPlanDetailSummary>(
        '/installment-plan-details/summary'
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || 'Failed to fetch summary'
      );
    },
  });
};

export const useCreateInstallmentPlanDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateInstallmentPlanDetailDto
    ): Promise<InstallmentPlanDetail> => {
      const response = await apiClient.post<InstallmentPlanDetail>(
        '/installment-plan-details',
        data
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || 'Failed to create plan detail'
      );
    },
    onSuccess: () => {
      customToast.success('Plan detail created successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to create plan detail');
    },
  });
};

export const useUpdateInstallmentPlanDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInstallmentPlanDetailDto;
    }): Promise<InstallmentPlanDetail> => {
      const response = await apiClient.put<InstallmentPlanDetail>(
        `/installment-plan-details/${id}`,
        data
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || 'Failed to update plan detail'
      );
    },
    onSuccess: (_, variables) => {
      customToast.success('Plan detail updated successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to update plan detail');
    },
  });
};

export const useDeleteInstallmentPlanDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(
        `/installment-plan-details/${id}`
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to delete plan detail'
        );
      }
    },
    onSuccess: () => {
      customToast.success('Plan detail deleted successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to delete plan detail');
    },
  });
};
