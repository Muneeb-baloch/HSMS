"use client";

import permissionApi from "@/lib/API/permissions";
import {
  BulkPermissionUpdateDto,
  CopyPermissionsDto,
  CreateUserPermissionDto,
  GetUserPermissionsResult,
  SetPermissionsDto,
  UpdateUserPermissionDto,
  UserPermission,
  UserPermissionQueryParams,
  UserPermissionStatistics,
} from "@/lib/types/permissions";
import { useCallback, useState } from "react";

interface UsePermissionsReturn {
  permissions: UserPermission[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UsePermissionFormReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  createPermission: (
    data: CreateUserPermissionDto,
  ) => Promise<UserPermission | null>;
  updatePermission: (
    id: string,
    data: UpdateUserPermissionDto,
  ) => Promise<UserPermission | null>;
  deletePermission: (id: string) => Promise<boolean>;
  setPermissions: (data: SetPermissionsDto) => Promise<UserPermission | null>;
  toggleStatus: (id: string) => Promise<UserPermission | null>;
}

interface UsePermissionsListReturn {
  permissions: UserPermission[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  loading: boolean;
  error: string | null;
  fetchPermissions: (params: UserPermissionQueryParams) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
}

/**
 * Hook to fetch and manage a single permission
 */
export const usePermission = (id: string | null): UsePermissionsReturn => {
  const [permission, setPermission] = useState<UserPermission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermission = useCallback(async () => {
    if (!id) {
      setError("Permission ID is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await permissionApi.getPermissionById(id);
      setPermission(response.data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch permission";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(fetchPermission, [fetchPermission]);

  // Auto-fetch when ID changes
  if (id && !permission && !loading && !error) {
    fetchPermission();
  }

  return {
    permissions: permission ? [permission] : null,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for permission form operations (create, update, delete)
 */
export const usePermissionForm = (): UsePermissionFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createPermission = useCallback(
    async (data: CreateUserPermissionDto): Promise<UserPermission | null> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await permissionApi.createPermission(data);
        setSuccess(true);
        return response.data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create permission";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updatePermission = useCallback(
    async (
      id: string,
      data: UpdateUserPermissionDto,
    ): Promise<UserPermission | null> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await permissionApi.updatePermission(id, data);
        setSuccess(true);
        return response.data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update permission";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deletePermission = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await permissionApi.deletePermission(id);
      setSuccess(true);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete permission";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const setPermissions = useCallback(
    async (data: SetPermissionsDto): Promise<UserPermission | null> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await permissionApi.setPermissions(data);
        setSuccess(true);
        return response.data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to set permissions";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const toggleStatus = useCallback(
    async (id: string): Promise<UserPermission | null> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await permissionApi.togglePermissionStatus(id);
        setSuccess(true);
        return response.data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to toggle permission status";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    success,
    createPermission,
    updatePermission,
    deletePermission,
    setPermissions,
    toggleStatus,
  };
};

/**
 * Hook for fetching and managing permissions list with pagination
 */
export const usePermissionsList = (): UsePermissionsListReturn => {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setCurrentPage] = useState(1);
  const [limit, setCurrentLimit] = useState(20);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(
    async (params: UserPermissionQueryParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await permissionApi.getPermissions({
          ...params,
          page: params.page || page,
          limit: params.limit || limit,
        });

        const result = response.data.data as GetUserPermissionsResult;
        setPermissions(result.userPermissions);
        setTotal(result.pagination.total);
        setPages(result.pagination.pages);
        setCurrentPage(result.pagination.page);
        setCurrentLimit(result.pagination.limit);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch permissions";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [page, limit],
  );

  const nextPage = useCallback(async () => {
    if (page < pages) {
      const newPage = page + 1;
      setCurrentPage(newPage);
      await fetchPermissions({ page: newPage, limit });
    }
  }, [page, pages, limit, fetchPermissions]);

  const prevPage = useCallback(async () => {
    if (page > 1) {
      const newPage = page - 1;
      setCurrentPage(newPage);
      await fetchPermissions({ page: newPage, limit });
    }
  }, [page, limit, fetchPermissions]);

  const setPage = useCallback(
    async (newPage: number) => {
      if (newPage >= 1 && newPage <= pages) {
        setCurrentPage(newPage);
        await fetchPermissions({ page: newPage, limit });
      }
    },
    [pages, limit, fetchPermissions],
  );

  const setLimit = useCallback(
    async (newLimit: number) => {
      setCurrentLimit(newLimit);
      setCurrentPage(1);
      await fetchPermissions({ page: 1, limit: newLimit });
    },
    [fetchPermissions],
  );

  return {
    permissions,
    total,
    page,
    limit,
    pages,
    loading,
    error,
    fetchPermissions,
    nextPage,
    prevPage,
    setPage,
    setLimit,
  };
};

/**
 * Hook for bulk permission operations
 */
export const useBulkPermissions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const bulkUpdate = useCallback(async (data: BulkPermissionUpdateDto) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await permissionApi.bulkUpdatePermissions(data);
      setSuccess(true);
      return response.data.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to bulk update permissions";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const copyPermissions = useCallback(async (data: CopyPermissionsDto) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await permissionApi.copyPermissions(data);
      setSuccess(true);
      return response.data.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to copy permissions";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, bulkUpdate, copyPermissions };
};

/**
 * Hook for permission analytics
 */
export const usePermissionStatistics = () => {
  const [statistics, setStatistics] = useState<UserPermissionStatistics | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await permissionApi.getStatistics();
      setStatistics(response.data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch statistics";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { statistics, loading, error, fetchStatistics };
};

/**
 * Hook to check if a role has a specific permission
 */
export const useCheckPermission = (
  roleId: string | null,
  moduleId: string | null,
  permissionType: string | null,
) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async () => {
    if (!roleId || !moduleId || !permissionType) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await permissionApi.checkPermission({
        roleId,
        srModuleId: moduleId,
        permissionType,
      });
      setHasPermission(response.data.data.hasPermission);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check permission";
      setError(errorMessage);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  }, [roleId, moduleId, permissionType]);

  if (
    roleId &&
    moduleId &&
    permissionType &&
    hasPermission === null &&
    !loading
  ) {
    checkPermission();
  }

  return { hasPermission, loading, error, checkPermission };
};
