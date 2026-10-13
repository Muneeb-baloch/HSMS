// src/hooks/entities/useCreateEntity.ts
import { useToast } from "@/components/context/ToastContext";
import { apiClient } from "@/lib/API/client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "next/dist/server/api-utils";

interface UseCreateEntityOptions<TResponse> {
  endpoint: string;
  invalidateQueries?: string[];
  onSuccess?: (data: TResponse) => void;
  onError?: (error: ApiError) => void;
}

export function useCreateEntity<TData, TResponse>({
  endpoint,
  invalidateQueries = [],
  onSuccess,
  onError,
}: UseCreateEntityOptions<TResponse>) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: TData): Promise<TResponse> => {
      const response = await apiClient.request<TResponse>({
        method: "POST",
        url: `/${endpoint}`,
        data,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      // Show success message
      showToast("Created successfully", "success");

      // Call custom onSuccess
      onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      let errorMessage = "Failed to create";
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as object & {
          response?: { data?: { error?: string } };
        };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
      //   dispatch(setError(errorMessage));
    },
  });
}
