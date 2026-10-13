// lib/hooks/entities/useStaffRegistry.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "staff-registry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDomesticStaff = (params: Record<string, any> = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 20;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.type) queryParams.type = params.type;
      if (params.verificationStatus) queryParams.verificationStatus = params.verificationStatus;

      const response = await apiClient.get("/staff-registry", { params: queryParams });
      if (response.data.success) {
        return {
          items: response.data.data.staffMembers ?? response.data.data.staff ?? (Array.isArray(response.data.data) ? response.data.data : []),
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch staff");
    },
  });
};

export const useStaffMember = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get(`/staff-registry/${id}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch staff member");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRegisterStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/staff-registry", data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to register staff");
    },
    onSuccess: () => {
      customToast.success("Staff registered successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to register staff");
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`/staff-registry/${id}`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update staff");
    },
    onSuccess: (_, variables) => {
      customToast.success("Staff updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update staff");
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/staff-registry/${id}`);
      if (!response.data.success) throw new Error(response.data.message || "Failed to delete staff");
    },
    onSuccess: () => {
      customToast.success("Staff deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete staff");
    },
  });
};

export const useVerifyStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/staff-registry/${id}/verify`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to verify staff");
    },
    onSuccess: (_, variables) => {
      customToast.success("Staff verified successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to verify staff");
    },
  });
};

export const useAddEmployment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/staff-registry/${id}/employment`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to add employment");
    },
    onSuccess: (_, variables) => {
      customToast.success("Employment added successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to add employment");
    },
  });
};

export const useEndEmployment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, employmentId, data }: { id: string; employmentId: string; data?: Record<string, unknown> }) => {
      const response = await apiClient.post(`/staff-registry/${id}/employment/${employmentId}/end`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to end employment");
    },
    onSuccess: (_, variables) => {
      customToast.success("Employment ended successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to end employment");
    },
  });
};

export const useRateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/staff-registry/${id}/rate`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to rate staff");
    },
    onSuccess: (_, variables) => {
      customToast.success("Staff rated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to rate staff");
    },
  });
};

export const useBlacklistStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`/staff-registry/${id}/blacklist`, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to blacklist staff");
    },
    onSuccess: (_, variables) => {
      customToast.success("Staff blacklisted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to blacklist staff");
    },
  });
};

export const useSearchByCNIC = (cnic: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "cnic", cnic],
    queryFn: async () => {
      const response = await apiClient.get(`/staff-registry/search/cnic/${cnic}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to search by CNIC");
    },
    enabled: !!cnic && cnic.length >= 13,
    staleTime: 0,
  });
};

export const useStaffBySociety = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "society", societyId],
    queryFn: async () => {
      const response = await apiClient.get(`/staff-registry/society/${societyId}`);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch staff by society");
    },
    enabled: !!societyId,
    staleTime: 5 * 60 * 1000,
  });
};
