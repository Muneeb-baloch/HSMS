// lib/hooks/entities/useSubscription.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CancelSubscriptionDto,
  CreatePackageDto,
  HistoryQueryParams,
  PackageQueryParams,
  SubscribeDto,
  SubscriptionHistory,
  SubscriptionPackage,
  UpdatePackageDto,
} from "@/lib/types/subscription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const PACKAGES_KEY = "subscription-packages";
const HISTORY_KEY = "subscription-history";

// ========================
// PACKAGE HOOKS
// ========================

export const useSubscriptionPackages = (params: PackageQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [PACKAGES_KEY, queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};

      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 10;

      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.search) queryParams.search = params.search;
      if (params.isActive !== undefined) queryParams.isActive = params.isActive;

      const response = await apiClient.get<{
        packages: SubscriptionPackage[];
        pagination: PaginatedResponse<SubscriptionPackage>["pagination"];
      }>("/subscriptions/packages", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.packages,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch packages");
    },
  });
};

export const useActivePackages = () => {
  return useQuery({
    queryKey: [PACKAGES_KEY, "active"],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionPackage[]>(
        "/subscriptions/packages/active",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch active packages",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubscriptionPackage = (id: string) => {
  return useQuery({
    queryKey: [PACKAGES_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionPackage>(
        `/subscriptions/packages/${id}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch package");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreatePackageDto,
    ): Promise<SubscriptionPackage> => {
      const response = await apiClient.post<SubscriptionPackage>(
        "/subscriptions/packages",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create package");
    },
    onSuccess: () => {
      customToast.success("Package created successfully");
      queryClient.invalidateQueries({ queryKey: [PACKAGES_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create package");
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePackageDto;
    }): Promise<SubscriptionPackage> => {
      const response = await apiClient.put<SubscriptionPackage>(
        `/subscriptions/packages/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update package");
    },
    onSuccess: (_, variables) => {
      customToast.success("Package updated successfully");
      queryClient.invalidateQueries({ queryKey: [PACKAGES_KEY] });
      queryClient.invalidateQueries({
        queryKey: [PACKAGES_KEY, variables.id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update package");
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(
        `/subscriptions/packages/${id}`,
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete package");
      }
    },
    onSuccess: () => {
      customToast.success("Package deleted successfully");
      queryClient.invalidateQueries({ queryKey: [PACKAGES_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete package");
    },
  });
};

// ========================
// SUBSCRIPTION MANAGEMENT HOOKS
// ========================

export const useSubscribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubscribeDto): Promise<SubscriptionHistory> => {
      const response = await apiClient.post<SubscriptionHistory>(
        "/subscriptions/subscribe",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to subscribe");
    },
    onSuccess: () => {
      customToast.success("Subscription activated successfully");
      queryClient.invalidateQueries({ queryKey: [HISTORY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["societies"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to subscribe");
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      societyId,
      data,
    }: {
      societyId: string;
      data?: CancelSubscriptionDto;
    }): Promise<void> => {
      const response = await apiClient.post(
        `/subscriptions/cancel/${societyId}`,
        data,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to cancel subscription",
        );
      }
    },
    onSuccess: () => {
      customToast.success("Subscription cancelled successfully");
      queryClient.invalidateQueries({ queryKey: [HISTORY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["societies"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to cancel subscription");
    },
  });
};

export const useSubscriptionHistory = (
  societyId: string,
  params: HistoryQueryParams = {},
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [HISTORY_KEY, societyId, queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};

      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 10;

      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.action) queryParams.action = params.action;
      if (params.paymentStatus)
        queryParams.paymentStatus = params.paymentStatus;

      const response = await apiClient.get<{
        history: SubscriptionHistory[];
        pagination: PaginatedResponse<SubscriptionHistory>["pagination"];
      }>(`/subscriptions/history/${societyId}`, { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.history,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch subscription history",
      );
    },
    enabled: !!societyId,
  });
};
