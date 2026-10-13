// src/lib/hooks/entities/useUserStaff.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
    BulkUpdateResult,
    CreateUserStaffDto,
    PaginatedUserStaffs,
    ResetPasswordDto,
    UpdateUserStaffDto,
    UserStaff,
    UserStaffQueryParams,
    UserStaffStatistics,
} from "@/lib/types/userStaff";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "userStaff";

export const useUserStaffs = (params: UserStaffQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async (): Promise<PaginatedUserStaffs> => {
      const queryParams: Record<string, any> = {};

      // Only include non-empty values
      Object.entries(params).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          queryParams[key] = value;
        }
      });

      // Handle boolean conversions
      if (params.isActive !== undefined) {
        queryParams.isActive = String(params.isActive);
      }

      const response = await apiClient.get<{
        userStaffs: UserStaff[];
        summary: any;
        pagination: PaginatedResponse<UserStaff>["pagination"];
      }>("/userstaff", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.userStaffs,
          summary: response.data.data.summary,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch user staff");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserStaff = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<UserStaff> => {
      const response = await apiClient.get<UserStaff>(`/userstaff/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch user staff");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const staffData = queryClient.getQueryData<PaginatedUserStaffs>([
        QUERY_KEY,
        {},
      ]);
      return staffData?.items.find((s: UserStaff) => s._id === id);
    },
  });
};

export const useCreateUserStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserStaffDto): Promise<UserStaff> => {
      // Clean up the payload - remove invalid placeholder values
      const payload: any = { ...data };

      // Filter out placeholder values
      if (payload.roleId === "role" || !payload.roleId) {
        delete payload.roleId;
      }
      if (payload.cityId === "city" || !payload.cityId) {
        delete payload.cityId;
      }

      const response = await apiClient.post<UserStaff>("/userstaff", payload);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create user staff");
    },
    onSuccess: () => {
      customToast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create user");
    },
  });
};

export const useUpdateUserStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserStaffDto;
    }): Promise<UserStaff> => {
      // Clean up the payload - remove invalid placeholder values
      const payload: any = { ...data };

      // Filter out placeholder values
      if (payload.roleId === "role" || !payload.roleId) {
        delete payload.roleId;
      }
      if (payload.cityId === "city" || !payload.cityId) {
        delete payload.cityId;
      }

      const response = await apiClient.put<UserStaff>(
        `/userstaff/${id}`,
        payload,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update user staff");
    },
    onSuccess: (_, variables) => {
      customToast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update user");
    },
  });
};

export const useDeleteUserStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/userstaff/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete user staff");
      }
    },
    onSuccess: () => {
      customToast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete user");
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<UserStaff> => {
      const response = await apiClient.patch<UserStaff>(
        `/userstaff/${id}/status`,
        { isActive: undefined }, // Will be toggled on server
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to toggle user status");
    },
    onSuccess: (_, id) => {
      customToast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle user status");
    },
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ResetPasswordDto;
    }): Promise<UserStaff> => {
      const response = await apiClient.patch<UserStaff>(
        `/userstaff/${id}/reset-password`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to reset password");
    },
    onSuccess: (_, variables) => {
      customToast.success("Password reset successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to reset password");
    },
  });
};

export const useBulkUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userIds,
      isActive,
    }: {
      userIds: string[];
      isActive: boolean;
    }): Promise<BulkUpdateResult> => {
      const response = await apiClient.post<BulkUpdateResult>(
        "/userstaff/bulk-update-status",
        {
          userIds,
          isActive,
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to bulk update users");
    },
    onSuccess: (data) => {
      customToast.success(`Updated ${data.modified} users`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to bulk update users");
    },
  });
};

export const useUserStaffStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async (): Promise<UserStaffStatistics> => {
      const response = await apiClient.get<UserStaffStatistics>(
        "/userstaff/statistics",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch user statistics",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchUserStaff = (searchTerm: string, limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEY, "search", searchTerm, limit],
    queryFn: async (): Promise<UserStaff[]> => {
      const response = await apiClient.get<UserStaff[]>("/userstaff/search", {
        params: { search: searchTerm, limit },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to search users");
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUsersByRole = (roleId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "role", roleId],
    queryFn: async (): Promise<UserStaff[]> => {
      const response = await apiClient.get<UserStaff[]>(
        `/userstaff/role/${roleId}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch users by role");
    },
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUsersByCity = (cityId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "city", cityId],
    queryFn: async (): Promise<UserStaff[]> => {
      const response = await apiClient.get<UserStaff[]>(
        `/userstaff/city/${cityId}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch users by city");
    },
    enabled: !!cityId,
    staleTime: 5 * 60 * 1000,
  });
};
