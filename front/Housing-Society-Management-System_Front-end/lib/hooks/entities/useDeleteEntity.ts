// src/hooks/entities/useDeleteEntity.ts
import { useToast } from "@/components/context/ToastContext";
import { apiClient } from "@/lib/API/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "next/dist/server/api-utils";

interface UseDeleteEntityOptions {
  endpoint: string;
  invalidateQueries?: string[];
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}
type EntityWithId = { _id: string };

type ListCache<T extends EntityWithId> = {
  items: T[];
  pagination?: unknown;
};

export function useDeleteEntity<T extends { _id: string }>({
  endpoint,
  invalidateQueries = [],
  onSuccess,
  onError,
}: UseDeleteEntityOptions) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.request({
        method: "DELETE",
        url: `/${endpoint}/${id}`,
      });
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [endpoint] });

      const previousData = queryClient.getQueryData<ListCache<T>>([endpoint]);

      queryClient.setQueryData<ListCache<T>>([endpoint], (old) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items.filter((item) => item._id !== id),
        };
      });

      return { previousData };
    },

    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([endpoint], context.previousData);
      }

      let errorMessage = "Failed to delete";
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as object & {
          response?: { data?: { error?: string } };
        };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
      showToast(errorMessage, "error");
      //   onError?.(error);
    },
    onSuccess: () => {
      // Invalidate queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      showToast("Deleted successfully", "success");
      onSuccess?.();
    },
    onSettled: () => {
      // Always refetch
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
  });
}
