// lib/hooks/useLogin.ts - UPDATED

import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { AxiosError, AxiosRequestConfig } from "axios";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setError, setTokens, setUser } from "../../lib/store/slices/authSlice";
import {
  ApiErrorResponse,
  AuthResponse,
  LoginCredentials,
} from "../../lib/types/auth";
import { apiClient } from "../API/client";
import { useToast } from "@/components/context/ToastContext";

interface LoginErrorConfig extends AxiosRequestConfig {
  data?: string;
}

export const useLogin = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { showToast } = useToast();

  const login: UseMutationResult<
    AuthResponse,
    AxiosError<ApiErrorResponse>,
    LoginCredentials
  > = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.login(credentials);
      return response.data as AuthResponse;
    },
    onSuccess: (data: AuthResponse) => {
      dispatch(setUser(data.data.user));
      dispatch(setTokens(data.data.tokens));
      showToast("Login successful! Redirecting to dashboard...", "success");
      router.push("/dashboard");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.error || errorData?.message || "Login failed";

      if (errorMessage.includes("verify your email")) {
        // Extract email from request config safely
        let email = "";
        if (error.config) {
          const config = error.config as LoginErrorConfig;
          try {
            const data = config.data ? JSON.parse(config.data) : null;
            email = data?.email || "";
          } catch (parseError) {
            console.error("Failed to parse error config data:", parseError);
          }
        }

        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        showToast("Please verify your email first", "warning");
      } else {
        showToast(errorMessage, "error");
      }

      dispatch(setError(errorMessage));
    },
  });

  return {
    mutate: login.mutate,
    mutateAsync: login.mutateAsync,
    isPending: login.isPending,
    isError: login.isError,
    isSuccess: login.isSuccess,
    data: login.data,
    error: login.error,
  };
};
