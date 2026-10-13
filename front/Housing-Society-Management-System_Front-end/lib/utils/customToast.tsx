"use client";

import { toast as sonnerToast } from "sonner";
import { CustomToast, type ToastType } from "@/components/ui/CustomToast";

const DEFAULT_DURATION = 5000;
const LOADING_DURATION = 999999; // Loading toasts stay until dismissed or updated

function showCustomToast(
  type: ToastType,
  message: string,
  options?: { title?: string; duration?: number }
) {
  const duration = type === "loading" ? LOADING_DURATION : (options?.duration ?? DEFAULT_DURATION);

  return sonnerToast.custom(
    (t) => (
      <CustomToast
        message={message}
        type={type}
        title={options?.title}
        onDismiss={() => sonnerToast.dismiss(t.id)}
      />
    ),
    {
      duration,
      unstyled: true,
    }
  );
}

export const customToast = {
  success: (message: string, options?: { title?: string; duration?: number }) =>
    showCustomToast("success", message, options),

  error: (message: string, options?: { title?: string; duration?: number }) =>
    showCustomToast("error", message, options),

  warning: (message: string, options?: { title?: string; duration?: number }) =>
    showCustomToast("warning", message, options),

  info: (message: string, options?: { title?: string; duration?: number }) =>
    showCustomToast("info", message, options),

  loading: (message: string, options?: { title?: string }) =>
    showCustomToast("loading", message, { ...options, duration: LOADING_DURATION }),

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  promise: sonnerToast.promise,
};
