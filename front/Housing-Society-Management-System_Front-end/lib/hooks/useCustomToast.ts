"use client";

import { useCallback } from "react";
import { customToast } from "@/lib/utils/customToast";

/**
 * Optional wrapper hook for easy custom toast usage with consistent API.
 * Use when you need a stable reference in useEffect/useCallback.
 */
export function useCustomToast() {
  const success = useCallback(
    (message: string, options?: { title?: string; duration?: number }) => {
      customToast.success(message, options);
    },
    []
  );

  const error = useCallback(
    (message: string, options?: { title?: string; duration?: number }) => {
      customToast.error(message, options);
    },
    []
  );

  const warning = useCallback(
    (message: string, options?: { title?: string; duration?: number }) => {
      customToast.warning(message, options);
    },
    []
  );

  const info = useCallback(
    (message: string, options?: { title?: string; duration?: number }) => {
      customToast.info(message, options);
    },
    []
  );

  const loading = useCallback((message: string, options?: { title?: string }) => {
    return customToast.loading(message, options);
  }, []);

  const dismiss = useCallback((id?: string | number) => {
    customToast.dismiss(id);
  }, []);

  return { success, error, warning, info, loading, dismiss };
}
