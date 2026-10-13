// src/lib/hooks/entities/useUserRole.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  BulkUpdateResult,
  CreateUserRoleDto,
  InitializeDefaultsResult,
  PaginatedUserRoles,
  RoleHierarchy,
  RoleWithCount,
  UpdateUserRoleDto,
  UserRole,
  UserRoleQueryParams,
  UserRoleStats,
} from "@/lib/types/userrole";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "userRoles";

export const useUserRoles = (params: UserRoleQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async (): Promise<PaginatedUserRoles> => {
      // Convert boolean values to strings
      const queryParams: Record<string, any> = { ...params };

      // Handle boolean conversions
      if (params.isActive !== undefined) {
        queryParams.isActive = String(params.isActive);
      }

      const response = await apiClient.get<{
        userRoles: UserRole[];
        summary: any;
        pagination: PaginatedResponse<UserRole>["pagination"];
      }>("/userrole", { params: queryParams });
      if (response.data.success) {
        return {
          items: response.data.data.userRoles,
          summary: response.data.data.summary,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch user roles");
    },
    staleTime: 5 * 60 * 1000,
  });
};

// export const useUserRole = (id: string) => {
//   const queryClient = useQueryClient();

//   return useQuery({
//     queryKey: [QUERY_KEY, id],
//     queryFn: async (): Promise<UserRole> => {
//       const response = await apiClient.get<UserRole>(`/roles/${id}`);

//       if (response.data.success) {
//         return response.data.data;
//       }
//       throw new Error(response.data.message || "Failed to fetch user role");
//     },
//     enabled: !!id,
//     staleTime: 5 * 60 * 1000,
//     initialData: () => {
//       const rolesData = queryClient.getQueryData<PaginatedUserRoles>([
//         QUERY_KEY,
//         {},
//       ]);
//       return rolesData?.items.find((r: UserRole) => r._id === id);
//     },
//   });
// };

export const useRoleByCode = (roleCode: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "code", roleCode],
    queryFn: async (): Promise<UserRole> => {
      const response = await apiClient.get<UserRole>(
        `/userrole/code/${roleCode}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch role");
    },
    enabled: !!roleCode,
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveRoles = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async (): Promise<UserRole[]> => {
      const response = await apiClient.get<UserRole[]>("/userrole/active");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch active roles");
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useRolesWithUserCount = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "with-count"],
    queryFn: async (): Promise<RoleWithCount[]> => {
      const response = await apiClient.get<RoleWithCount[]>(
        "/userrole/with-user-count",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch roles with user count",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchRoles = (searchTerm: string, limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEY, "search", searchTerm, limit],
    queryFn: async (): Promise<UserRole[]> => {
      const response = await apiClient.get<UserRole[]>("/userrole/search", {
        params: { search: searchTerm, limit },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to search roles");
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRoleDto): Promise<UserRole> => {
      const response = await apiClient.post<UserRole>("/userrole", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create user role");
    },
    onSuccess: () => {
      customToast.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create role");
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserRoleDto;
    }): Promise<UserRole> => {
      const response = await apiClient.put<UserRole>(`/userrole/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update user role");
    },
    onSuccess: (_, variables) => {
      customToast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update role");
    },
  });
};

export const useDeleteUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/userrole/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete user role");
      }
    },
    onSuccess: () => {
      customToast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete role");
    },
  });
};

export const useBulkUpdateRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleIds,
      isActive,
    }: {
      roleIds: string[];
      isActive: boolean;
    }): Promise<BulkUpdateResult> => {
      const response = await apiClient.post<BulkUpdateResult>(
        "/userrole/bulk-update",
        {
          roleIds,
          isActive,
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to bulk update roles");
    },
    onSuccess: (data) => {
      customToast.success(`Updated ${data.modified} roles`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to bulk update roles");
    },
  });
};

export const useToggleRoleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<UserRole> => {
      const response = await apiClient.patch<UserRole>(
        `/userrole/${id}/toggle-status`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to toggle role status");
    },
    onSuccess: (_, id) => {
      customToast.success("Role status updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle role status");
    },
  });
};

export const useInitializeDefaultRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<InitializeDefaultsResult> => {
      const response = await apiClient.post<InitializeDefaultsResult>(
        "/userrole/initialize-defaults",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to initialize default roles",
      );
    },
    onSuccess: (data) => {
      customToast.success(`Initialized ${data.created + data.updated} roles`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to initialize default roles");
    },
  });
};

export const useUserRoleStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async (): Promise<UserRoleStats> => {
      const response = await apiClient.get<UserRoleStats>(
        "/userrole/statistics",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch role statistics",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useRoleHierarchy = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "hierarchy"],
    queryFn: async (): Promise<RoleHierarchy[]> => {
      const response = await apiClient.get<RoleHierarchy[]>(
        "/userrole/hierarchy",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch role hierarchy",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};
// Add this to src/lib/hooks/entities/useUserRole.ts
export const useUserRole = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<UserRole> => {
      const response = await apiClient.get<UserRole>(`/userrole/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch user role");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    // Use initial data from cache if available
    initialData: () => {
      const rolesData = queryClient.getQueryData<PaginatedUserRoles>([
        QUERY_KEY,
        {},
      ]);
      return rolesData?.items.find((r: UserRole) => r._id === id);
    },
    initialDataUpdatedAt: () => {
      return queryClient.getQueryState([QUERY_KEY, {}])?.dataUpdatedAt;
    },
  });
};
