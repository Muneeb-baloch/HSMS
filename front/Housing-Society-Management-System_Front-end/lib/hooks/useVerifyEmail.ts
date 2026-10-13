"use client";

import { useMutation } from "@tanstack/react-query";

import { useToast } from "@/components/context/ToastContext";
import { useAppDispatch } from "@/lib/store/hooks";
import { setError, setUser } from "@/lib/store/slices/authSlice";
import { ApiError } from "next/dist/server/api-utils";
import { api } from "../API/client";

interface VerifyEmailData {
  email: string;
  otp: string;
}

export function useVerifyEmailOTP() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const verifyEmail = useMutation({
    mutationFn: async (data: VerifyEmailData) => {
      const response = await api.verifyEmailOTP(data.email, data.otp);
      return response.data;
    },
    onSuccess: (data) => {
      // Update user email verification status
      if (data.data.user) {
        dispatch(setUser(data.data.user));
      }
      if (data.message) {
        showToast(data.message, "success");
      }
    },
    onError: (error: ApiError) => {
      // const errorMessage = error.response?.data?.error || "Verification failed";
      let errorMessage = "Verification failed";

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
    verifyEmail,
    isPending: verifyEmail.isPending,
    isError: verifyEmail.isError,
    isSuccess: verifyEmail.isSuccess,
  };
}
