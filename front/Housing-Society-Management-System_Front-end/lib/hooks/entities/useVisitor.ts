// lib/hooks/entities/useVisitor.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateVisitorDto,
  UpdateVisitorDto,
  Visitor,
  VisitorQueryParams,
  VisitorStats,
} from "@/lib/types/visitor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "visitors";

export const useVisitors = (params: VisitorQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};

      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;

      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.purpose) queryParams.purpose = params.purpose;
      if (params.hostMemberId) queryParams.hostMemberId = params.hostMemberId;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get<{
        visitors: Visitor[];
        pagination: PaginatedResponse<Visitor>["pagination"];
      }>("/visitors", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.visitors,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch visitors");
    },
  });
};

export const useVisitor = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Visitor>(`/visitors/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch visitor");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const visitorsData = queryClient.getQueryData<any>([QUERY_KEY, {}]);
      return visitorsData?.items?.find((v: Visitor) => v._id === id);
    },
  });
};

export const useCreateVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVisitorDto): Promise<Visitor> => {
      const response = await apiClient.post<Visitor>("/visitors", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create visitor");
    },
    onSuccess: () => {
      customToast.success("Visitor created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create visitor");
    },
  });
};

export const useUpdateVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateVisitorDto;
    }): Promise<Visitor> => {
      const response = await apiClient.put<Visitor>(`/visitors/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update visitor");
    },
    onSuccess: (_, variables) => {
      customToast.success("Visitor updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update visitor");
    },
  });
};

export const useDeleteVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/visitors/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete visitor");
      }
    },
    onSuccess: () => {
      customToast.success("Visitor deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete visitor");
    },
  });
};

export const useCheckInVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      gateNumber,
    }: {
      id: string;
      gateNumber?: string;
    }): Promise<Visitor> => {
      const response = await apiClient.post<Visitor>(
        `/visitors/${id}/check-in`,
        { gateNumber },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to check in visitor");
    },
    onSuccess: (_, variables) => {
      customToast.success("Visitor checked in successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to check in visitor");
    },
  });
};

export const useCheckOutVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      remarks,
    }: {
      id: string;
      remarks?: string;
    }): Promise<Visitor> => {
      const response = await apiClient.post<Visitor>(
        `/visitors/${id}/check-out`,
        { remarks },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to check out visitor");
    },
    onSuccess: (_, variables) => {
      customToast.success("Visitor checked out successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to check out visitor");
    },
  });
};

export const usePreApproveVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVisitorDto): Promise<Visitor> => {
      const response = await apiClient.post<Visitor>(
        "/visitors/pre-approve",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to pre-approve visitor",
      );
    },
    onSuccess: () => {
      customToast.success("Visitor pre-approved successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to pre-approve visitor");
    },
  });
};

export const useActiveVisitors = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async () => {
      const response = await apiClient.get<Visitor[]>("/visitors/active");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch active visitors",
      );
    },
    staleTime: 30 * 1000, // 30 seconds for active visitors
  });
};

export const useVisitorStats = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "stats"],
    queryFn: async () => {
      const response = await apiClient.get<VisitorStats>("/visitors/stats");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch visitor statistics",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useVerifyPassCode = (code: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "verify", code],
    queryFn: async () => {
      const response = await apiClient.get<Visitor>(
        `/visitors/verify/${code}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to verify pass code");
    },
    enabled: !!code,
    staleTime: 0,
  });
};

export const useCancelVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Visitor> => {
      const response = await apiClient.post<Visitor>(
        `/visitors/${id}/cancel`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to cancel visit");
    },
    onSuccess: (_, id) => {
      customToast.success("Visit cancelled successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to cancel visit");
    },
  });
};
