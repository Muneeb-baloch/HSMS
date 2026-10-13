// src/lib/hooks/entities/useNominee.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateNomineeDto,
  Nominee,
  NomineeQueryParams,
  NomineeStatistics,
  NomineeSummary,
  RelationType,
  ShareDistribution,
  UpdateNomineeDto,
} from "@/lib/types/nominee";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "nominees";

export const useNominees = (params: NomineeQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, any> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };

      if (params.memId) queryParams.memId = params.memId;
      if (params.search) queryParams.search = params.search;
      if (params.relationWithMember)
        queryParams.relationWithMember = params.relationWithMember;
      if (params.isActive !== undefined) queryParams.isActive = params.isActive;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<{
        nominees: Nominee[];
        pagination: PaginatedResponse<Nominee>["pagination"];
      }>("/nominee", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.nominees,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch nominees");
    },
  });
};

export const useNominee = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Nominee>(`/nominee/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch nominee");
    },
    enabled: !!id,
  });
};

export const useNomineesByMember = (
  memId: string,
  activeOnly: boolean = true,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "member", memId, activeOnly],
    queryFn: async () => {
      const response = await apiClient.get<Nominee[]>(
        `/nominee/member/${memId}`,
        {
          params: { activeOnly },
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch member nominees",
      );
    },
    enabled: !!memId,
  });
};

export const useMemberShareCoverage = (memId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "coverage", memId],
    queryFn: async () => {
      const response = await apiClient.get<{
        totalShare: number;
        coveragePercentage: number;
        isFullyCovered: boolean;
        nominees: Nominee[];
      }>(`/nominee/member/${memId}/coverage`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch share coverage",
      );
    },
    enabled: !!memId,
  });
};

export const useNomineeStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get<NomineeStatistics>(
        "/nominee/statistics",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch nominee statistics",
      );
    },
  });
};

export const useNomineeSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "summary"],
    queryFn: async () => {
      const response = await apiClient.get<NomineeSummary>("/nominee/summary");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch nominee summary",
      );
    },
  });
};

export const useShareDistribution = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "distribution"],
    queryFn: async () => {
      const response = await apiClient.get<ShareDistribution[]>(
        "/nominee/share-distribution",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch share distribution",
      );
    },
  });
};

export const useMembersWithoutFullCoverage = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "without-coverage"],
    queryFn: async () => {
      const response = await apiClient.get<
        Array<{
          memberId: string;
          memberName: string;
          totalShare: number;
          nomineesCount: number;
        }>
      >("/nominee/members-without-coverage");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch members without coverage",
      );
    },
  });
};

export const useNomineesDropdown = (memId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "dropdown", memId],
    queryFn: async () => {
      const params: any = {};
      if (memId) params.memId = memId;

      const response = await apiClient.get<
        Array<{
          value: string;
          label: string;
          nomineeName: string;
          relation: RelationType;
          sharePercentage: number;
          cnic: string;
        }>
      >("/nominee/dropdown", { params });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch nominees dropdown",
      );
    },
    enabled: !!memId,
  });
};

export const useSearchNominees = (searchTerm: string, limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEY, "search", searchTerm],
    queryFn: async () => {
      const response = await apiClient.get<Nominee[]>("/nominee/search", {
        params: { q: searchTerm, limit },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to search nominees");
    },
    enabled: searchTerm.length >= 2,
  });
};

export const useCreateNominee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNomineeDto): Promise<Nominee> => {
      const response = await apiClient.post<Nominee>("/nominee", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create nominee");
    },
    onSuccess: (data) => {
      customToast.success("Nominee created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "member", data.memId],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "statistics"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create nominee");
    },
  });
};

export const useUpdateNominee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateNomineeDto;
    }): Promise<Nominee> => {
      const response = await apiClient.put<Nominee>(`/nominee/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update nominee");
    },
    onSuccess: (data) => {
      customToast.success("Nominee updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "member", data.memId],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "statistics"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update nominee");
    },
  });
};

export const useDeleteNominee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/nominee/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete nominee");
      }
    },
    onSuccess: (_, id) => {
      customToast.success("Nominee deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete nominee");
    },
  });
};

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nomineeIds,
      isActive,
    }: {
      nomineeIds: string[];
      isActive: boolean;
    }): Promise<{ matched: number; modified: number }> => {
      const response = await apiClient.post<any>(
        "/nominee/bulk/update-status",
        {
          nomineeIds,
          isActive,
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update status");
    },
    onSuccess: (data) => {
      customToast.success(`Status updated for ${data.modified} nominees`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "statistics"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update status");
    },
  });
};

export const useValidateNominee = () => {
  return useMutation({
    mutationFn: async (
      data: CreateNomineeDto | UpdateNomineeDto,
    ): Promise<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }> => {
      const response = await apiClient.post<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
      }>("/nominee/validate", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to validate nominee");
    },
  });
};

export const useToggleNomineeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }): Promise<Nominee> => {
      const response = await apiClient.put<Nominee>(`/nominee/${id}`, {
        isActive,
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update status");
    },
    onSuccess: (data) => {
      customToast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "member", data.memId],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "statistics"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update status");
    },
  });
};
