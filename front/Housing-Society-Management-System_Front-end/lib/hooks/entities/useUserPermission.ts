// src/lib/hooks/entities/useUserPermission.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  BulkPermissionUpdateDto,
  CopyPermissionsDto,
  CreateUserPermissionDto,
  InitializeDefaultsResult,
  ModulePermissionsSummary,
  PaginatedUserPermissions,
  PermissionCheckDto,
  RolePermissionsMap,
  RolePermissionsSummary,
  SetPermissionsDto,
  UpdateUserPermissionDto,
  UserPermission,
  UserPermissionQueryParams,
  UserPermissionStats,
} from "@/lib/types/userpermission";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "userPermissions";

export const useUserPermissions = (params: UserPermissionQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async (): Promise<PaginatedUserPermissions> => {
      // Convert boolean values to strings
      const queryParams: Record<string, any> = { ...params };

      // Handle boolean conversions
      if (params.isActive !== undefined) {
        queryParams.isActive = String(params.isActive);
      }
      if (params.hasAccess !== undefined) {
        queryParams.hasAccess = String(params.hasAccess);
      }

      const response = await apiClient.get<{
        userPermissions: UserPermission[];
        summary: any;
        pagination: PaginatedResponse<UserPermission>["pagination"];
      }>("/permission", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.userPermissions,
          summary: response.data.data.summary,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch user permissions",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserPermission = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<UserPermission> => {
      const response = await apiClient.get<UserPermission>(`/permission/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch user permission",
      );
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const permissionsData =
        queryClient.getQueryData<PaginatedUserPermissions>([QUERY_KEY, {}]);
      return permissionsData?.items.find((p: UserPermission) => p._id === id);
    },
  });
};

export const usePermissionsByRole = (roleId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "role", roleId],
    queryFn: async (): Promise<UserPermission[]> => {
      const response = await apiClient.get<UserPermission[]>(
        `/permission/role/${roleId}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch permissions by role",
      );
    },
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePermissionsByModule = (moduleId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "module", moduleId],
    queryFn: async (): Promise<UserPermission[]> => {
      const response = await apiClient.get<UserPermission[]>(
        `/permission/module/${moduleId}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch permissions by module",
      );
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePermissionByRoleAndModule = (
  roleId: string,
  moduleId: string,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "role-module", roleId, moduleId],
    queryFn: async (): Promise<UserPermission> => {
      const response = await apiClient.get<UserPermission>(
        "/permission/by-role-module",
        {
          params: { roleId, srModuleId: moduleId },
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch permission");
    },
    enabled: !!roleId && !!moduleId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckPermission = () => {
  return useMutation({
    mutationFn: async (
      data: PermissionCheckDto,
    ): Promise<{ hasPermission: boolean }> => {
      const response = await apiClient.post<{ hasPermission: boolean }>(
        "/permission/check",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to check permission");
    },
  });
};

export const useCreateUserPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateUserPermissionDto,
    ): Promise<UserPermission> => {
      const response = await apiClient.post<UserPermission>(
        "/permission",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to create user permission",
      );
    },
    onSuccess: () => {
      customToast.success("Permission created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create permission");
    },
  });
};

export const useUpdateUserPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserPermissionDto;
    }): Promise<UserPermission> => {
      const response = await apiClient.put<UserPermission>(
        `/permission/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to update user permission",
      );
    },
    onSuccess: (_, variables) => {
      customToast.success("Permission updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update permission");
    },
  });
};

export const useDeleteUserPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/permission/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete user permission",
        );
      }
    },
    onSuccess: () => {
      customToast.success("Permission deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete permission");
    },
  });
};

export const useSetPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetPermissionsDto): Promise<UserPermission> => {
      const response = await apiClient.post<UserPermission>(
        "/permission/set",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to set permissions");
    },
    onSuccess: () => {
      customToast.success("Permissions set successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to set permissions");
    },
  });
};

export const useBulkUpdatePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: BulkPermissionUpdateDto,
    ): Promise<{ matched: number; modified: number }> => {
      const response = await apiClient.post<{
        matched: number;
        modified: number;
      }>("/permission/bulk-update", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to bulk update permissions",
      );
    },
    onSuccess: (data) => {
      customToast.success(`Updated ${data.modified} permissions`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to bulk update permissions");
    },
  });
};

export const useCopyPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CopyPermissionsDto,
    ): Promise<CopyPermissionsResult> => {
      const response = await apiClient.post<CopyPermissionsResult>(
        "/permission/copy",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to copy permissions");
    },
    onSuccess: (data) => {
      customToast.success(
        `Copied ${data.copied} permissions (${data.skipped} skipped)`,
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to copy permissions");
    },
  });
};

export const useInitializeDefaultPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<InitializeDefaultsResult> => {
      const response = await apiClient.post<InitializeDefaultsResult>(
        "/permission/initialize-defaults",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to initialize default permissions",
      );
    },
    onSuccess: (data) => {
      customToast.success(`Initialized ${data.created + data.updated} permissions`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to initialize default permissions");
    },
  });
};

export const useTogglePermissionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<UserPermission> => {
      const response = await apiClient.patch<UserPermission>(
        `/permission/${id}/toggle-status`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to toggle permission status",
      );
    },
    onSuccess: (_, id) => {
      customToast.success("Permission status updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle permission status");
    },
  });
};

export const useUserPermissionStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async (): Promise<UserPermissionStats> => {
      const response = await apiClient.get<UserPermissionStats>(
        "/permission/statistics",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch permission statistics",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useRolePermissionsSummary = (roleId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "role-summary", roleId],
    queryFn: async (): Promise<RolePermissionsSummary> => {
      const response = await apiClient.get<RolePermissionsSummary>(
        `/permission/role/${roleId}/summary`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch role permissions summary",
      );
    },
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useModulePermissionsSummary = (moduleId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "module-summary", moduleId],
    queryFn: async (): Promise<ModulePermissionsSummary> => {
      const response = await apiClient.get<ModulePermissionsSummary>(
        `/permission/module/${moduleId}/summary`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch module permissions summary",
      );
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRolePermissionsMap = (roleId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "role-map", roleId],
    queryFn: async (): Promise<RolePermissionsMap> => {
      const response = await apiClient.get<RolePermissionsMap>(
        `/permission/role/${roleId}/map`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch role permissions map",
      );
    },
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
};
