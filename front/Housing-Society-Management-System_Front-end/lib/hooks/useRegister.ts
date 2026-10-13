// lib/hooks/useRegister.ts - Fixed version

import { useToast } from "@/components/context/ToastContext";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "../API/client";
import { RegisterData } from "../types/auth";
interface RegisterResponse {
  success: boolean;
  data: {
    tempUserId: string;
  };
  message: string;
}

interface UseRegisterReturn {
  register: UseMutationResult<RegisterResponse, Error, RegisterData>;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export const useRegister = (): UseRegisterReturn => {
  const router = useRouter();
  const { showToast } = useToast();
  const mutation = useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data: RegisterData): Promise<RegisterResponse> => {
      try {
        // console.log("Registering user with data:", {
        //   email: data.email,
        //   firstName: data.firstName,
        //   phone: data.phone,
        // });

        const response = await apiClient.register(data);

        // console.log("Register response:", response.data);

        if (!response.data.success) {
          throw new Error(response.data.message || "Registration failed");
        }

        return response.data;
      } catch (error) {
        console.error("Register API error:", error);
        const errorMessage = "Registration failed";
        showToast(errorMessage, "error");
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, variables) => {
      // console.log("Registration successful:", data);

      if (data.success && data.data?.tempUserId) {
        showToast(
          data.message || "Registration successful! Please verify your email.",
          "success"
        ); // Redirect to OTP verification page
        router.push(
          `/verify-email?email=${encodeURIComponent(
            variables.email
          )}&tempUserId=${data.data.tempUserId}`
        );
      } else {
        showToast(
          data.message || "Registration completed but no tempUserId received",
          "info"
        );
        // alert(
        //   data.message || "Registration completed but no tempUserId received"
        // );
      }
    },
    onError: (error: Error) => {
      const message = error.message.includes("User already exists")
        ? "This email is already registered. Please login instead."
        : error.message || "Something went wrong";

      showToast(message, "error");
    },
  });

  return {
    register: mutation,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
};
