// src/hooks/entities/useUpdateEntity.ts
import { useToast } from "@/components/context/ToastContext";
import { apiClient } from "@/lib/API/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "next/dist/server/api-utils";

interface UseUpdateEntityOptions<TResponse> {
  endpoint: string;
  invalidateQueries?: string[];
  onSuccess?: (data: TResponse) => void;
  onError?: (error: ApiError) => void;
}

export function useUpdateEntity<TData, TResponse>({
  endpoint,
  invalidateQueries = [],
  onSuccess,
  onError,
}: UseUpdateEntityOptions<TResponse>) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: TData;
    }): Promise<TResponse> => {
      const response = await apiClient.request<TResponse>({
        method: "PUT",
        url: `/${endpoint}/${id}`,
        data,
      });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      // Update cache optimistically
      queryClient.setQueryData([endpoint, variables.id], data);

      // Show success message
      showToast("Updated successfully", "success");

      // Call custom onSuccess
      onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      let errorMessage = "Failed to update";
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as object & {
          response?: { data?: { error?: string } };
        };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
      onError?.(error);
    },
  });
}
