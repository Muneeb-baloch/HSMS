"use client";

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "../API/client";

// The data structure inside the API response
interface ResendOTPData {
  tempUserId: string;
}

export function useResendRegistrationOTP() {
  const resendOTP: UseMutationResult<ResendOTPData, Error, string> =
    useMutation({
      mutationFn: async (tempUserId: string): Promise<ResendOTPData> => {
        // Don't specify generic, or specify any
        const response = await apiClient.request({
          method: "POST",
          url: "/auth/resend-registration-otp",
          data: { tempUserId },
        });

        // response.data is ApiResponse<ResendOTPData>
        if (response.data.success) {
          return response.data.data as unknown as ResendOTPData; // This is ResendOTPData
        }
        throw new Error(response.data.message || "Failed to resend OTP");
      },
      onError: (error: Error) => {
        console.error("Resend OTP error:", error);
        throw error;
      },
    });

  return {
    resendOTP: resendOTP.mutateAsync,
    isPending: resendOTP.isPending,
    isError: resendOTP.isError,
    isSuccess: resendOTP.isSuccess,
    data: resendOTP.data,
    error: resendOTP.error,
  };
}
