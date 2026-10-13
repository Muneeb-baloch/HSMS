"use client";

import { useToast } from "@/components/context/ToastContext";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "../API/client";
import { AuthTokens, User } from "../types/auth";

interface VerifyRegistrationOTPData {
  tempUserId: string;
  otp: string;
}

// The actual data returned by the API in the 'data' field
interface VerifyRegistrationData {
  user: User;
  tokens: AuthTokens;
}

// API response wrapper (what apiClient returns)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export function useVerifyRegistrationOTP() {
  const router = useRouter();
  const { showToast } = useToast();

  const verifyOTP: UseMutationResult<
    VerifyRegistrationData, // The actual data, not the wrapper
    Error,
    VerifyRegistrationOTPData
  > = useMutation({
    mutationFn: async (
      data: VerifyRegistrationOTPData,
    ): Promise<VerifyRegistrationData> => {
      const response = await apiClient.request<
        ApiResponse<VerifyRegistrationData>
      >({
        method: "POST",
        url: "/auth/verify-registration-otp",
        data,
      });

      // Extract the actual data from the API response wrapper
      if (response.data.success) {
        return response.data.data as unknown as VerifyRegistrationData; // This is VerifyRegistrationData
      }
      throw new Error(response.data.message || "Verification failed");
    },
    onSuccess: (data, variables, context) => {
      // 'data' here is VerifyRegistrationData (user and tokens)
      if (data?.tokens?.accessToken) {
        localStorage.setItem("accessToken", data.tokens.accessToken);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      showToast("Email verified successfully!", "success");
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 2000);
    },
    onError: (error: Error) => {
      console.error("OTP verification error:", error);
      showToast(error.message || "Verification failed", "error");
      throw error;
    },
  });

  return {
    verifyOTP: verifyOTP.mutateAsync,
    isPending: verifyOTP.isPending,
    isError: verifyOTP.isError,
    isSuccess: verifyOTP.isSuccess,
    data: verifyOTP.data,
    error: verifyOTP.error,
  };
}
