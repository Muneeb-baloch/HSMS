// src/hooks/entities/useEntityList.ts
import { apiClient } from "@/lib/API/client";
import { ApiResponse } from "@/lib/types/api";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useCallback, useState } from "react";

interface UseEntityListOptions {
  endpoint: string;
  initialParams?: Record<string, unknown>;
  queryKey?: string[];
  enabled?: boolean;
}
type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export function useEntityList<T>({
  endpoint,
  initialParams = {},
  queryKey = [],
  enabled = true,
}: UseEntityListOptions) {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
    ...initialParams,
  });

  const query = useQuery({
    queryKey: [endpoint, ...queryKey, params],
    queryFn: async () => {
      const queryString = new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== "")
          .reduce(
            (acc, [key, value]) => ({
              ...acc,
              [key]: String(value),
            }),
            {} as Record<string, string>
          )
      ).toString();

      const response: AxiosResponse<ApiResponse<PaginatedResponse<T>>> =
        await apiClient.request<PaginatedResponse<T>>({
          method: "GET",
          url: `/${endpoint}?${queryString}`,
        });

      return response.data.data;
    },
    enabled,
  });

  const updateParams = useCallback((updates: Partial<typeof params>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    data: query.data?.items || [],
    pagination: query.data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    params,
    setParams: updateParams,
    refetch: query.refetch,
  };
}
