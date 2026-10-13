import { permissionApi } from "@/lib/API/permissions";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addPermission,
  removePermission,
  setCreating,
  setDeleting,
  setError,
  setFilters,
  setLoading,
  setPages,
  setPermissions,
  setSummary,
  setTotal,
  setUpdating,
} from "@/lib/store/slices/permissionSlice";
import {
  CreateUserPermissionDto,
  UpdateUserPermissionDto,
  UserPermission,
  UserPermissionQueryParams,
} from "@/lib/types/permissions";
import { useCallback, useState } from "react";

/**
 * Hook for fetching permissions list with pagination
 */
export const usePermissions = () => {
  const dispatch = useAppDispatch();
  const {
    items: permissions,
    filters,
    total,
    pages,
    isLoading,
    error,
    summary,
  } = useAppSelector((state) => state.permissions);

  const fetchPermissions = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await permissionApi.getPermissions(filters);
      if (response.data.success) {
        const result = response.data.data;
        dispatch(setPermissions(result.userPermissions));
        dispatch(setTotal(result.pagination.total));
        dispatch(setPages(result.pagination.pages));
        dispatch(
          setSummary({
            totalPermissions: result.summary.totalPermissions,
            activePermissions: result.summary.activePermissions,
            byAccessType: result.summary.byAccessType,
          }),
        );
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch permissions";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [filters, dispatch]);

  const updateFilters = useCallback(
    (newFilters: Partial<UserPermissionQueryParams>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch],
  );

  const changePage = useCallback(
    (page: number) => {
      dispatch(setFilters({ page }));
    },
    [dispatch],
  );

  const changeSearch = useCallback(
    (search: string) => {
      dispatch(setFilters({ search, page: 1 }));
    },
    [dispatch],
  );

  return {
    permissions,
    filters,
    total,
    pages,
    isLoading,
    error,
    summary,
    fetchPermissions,
    updateFilters,
    changePage,
    changeSearch,
  };
};

/**
 * Hook for fetching single permission
 */
export const usePermission = (permissionId: string | null) => {
  const [data, setData] = useState<UserPermission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermission = useCallback(async () => {
    if (!permissionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await permissionApi.getPermissionById(permissionId);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch permission";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [permissionId]);

  return { data, isLoading, error, fetchPermission };
};

/**
 * Hook for permission form operations (create/update)
 */
export const usePermissionForm = () => {
  const dispatch = useAppDispatch();
  const { isCreating, isUpdating, error } = useAppSelector(
    (state) => state.permissions,
  );

  const createPermission = useCallback(
    async (data: CreateUserPermissionDto) => {
      dispatch(setCreating(true));
      dispatch(setError(null));

      try {
        const response = await permissionApi.createPermission(data);
        if (response.data.success) {
          dispatch(addPermission(response.data.data));
          return { success: true, data: response.data.data };
        }
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to create permission";
        dispatch(setError(message));
        return { success: false, error: message };
      } finally {
        dispatch(setCreating(false));
      }
    },
    [dispatch],
  );

  const updatePermission = useCallback(
    async (id: string, data: UpdateUserPermissionDto) => {
      dispatch(setUpdating(true));
      dispatch(setError(null));

      try {
        const response = await permissionApi.updatePermission(id, data);
        if (response.data.success) {
          dispatch(updatePermission(response.data.data));
          dispatch(setUpdating(false));
          return { success: true, data: response.data.data };
        }
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to update permission";
        dispatch(setError(message));
        dispatch(setUpdating(false));
        return { success: false, error: message };
      }
    },
    [dispatch],
  );

  return { createPermission, updatePermission, isCreating, isUpdating, error };
};

/**
 * Hook for delete operations
 */
export const useDeletePermission = () => {
  const dispatch = useAppDispatch();
  const { isDeleting } = useAppSelector((state) => state.permissions);

  const deletePermission = useCallback(
    async (id: string) => {
      dispatch(setDeleting(true));
      dispatch(setError(null));

      try {
        const response = await permissionApi.deletePermission(id);
        if (response.data.success) {
          dispatch(removePermission(id));
          dispatch(setDeleting(false));
          return { success: true };
        }
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to delete permission";
        dispatch(setError(message));
        dispatch(setDeleting(false));
        return { success: false, error: message };
      }
    },
    [dispatch],
  );

  const toggleStatus = useCallback(
    async (id: string) => {
      dispatch(setUpdating(true));
      dispatch(setError(null));

      try {
        const response = await permissionApi.togglePermissionStatus(id);
        if (response.data.success) {
          dispatch(setUpdating(false));
          return { success: true, data: response.data.data };
        }
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to toggle permission status";
        dispatch(setError(message));
        dispatch(setUpdating(false));
        return { success: false, error: message };
      }
    },
    [dispatch],
  );

  return { deletePermission, toggleStatus, isDeleting };
};

/**
 * Hook for searching permissions
 */
export const useSearchPermissions = () => {
  const [results, setResults] = useState<UserPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm: string, limit?: number) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search is handled through the main getPermissions API with search param
      setResults([]);
    } catch (err: any) {
      const message = err.response?.data?.message || "Search failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, isLoading, error, search };
};
