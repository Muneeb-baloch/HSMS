"use client";

import { useMutation } from "@tanstack/react-query";

import { useToast } from "@/components/context/ToastContext";
import { useAppDispatch } from "@/lib/store/hooks";
import { setError } from "@/lib/store/slices/authSlice";
import { ApiError } from "next/dist/server/api-utils";
import { api } from "../API/client";
interface ResendOTPResponse {
  success: boolean;
  message?: string;
}
export function useResendVerificationOTP() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const resendOTP = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.sendVerificationOTP(email);
      return response.data;
    },
    onSuccess: (data: ResendOTPResponse) => {
      if (data.message) {
        showToast(data.message, "success");
      }
    },
    onError: (error: ApiError) => {
      let errorMessage = "Failed to resend verification code";
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as object & {
          response?: { data?: { error?: string } };
        };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
      dispatch(setError(errorMessage));
    },
  });

  return {
    resendOTP,
    isPending: resendOTP.isPending,
  };
}
