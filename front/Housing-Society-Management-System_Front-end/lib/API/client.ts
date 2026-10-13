import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { UserRole } from "../constants/roles";
import { ApiResponse } from "../types/api";
import {
  AuthResponse,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
} from "../types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let refreshPromise: Promise<string> | null = null;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

// ----------------------
// Token helpers
// ----------------------
const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

const setAccessToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

const clearTokens = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tokens");
    localStorage.removeItem("userRole");
  }
};
const getUserRole = (): UserRole | null => {
  if (typeof window !== "undefined") {
    const role = localStorage.getItem("userRole") as UserRole;
    // Validate if the role exists in UserRole enum
    if (role && Object.values(UserRole).includes(role)) {
      return role;
    }
  }
  return null;
};

const setUserRole = (role: UserRole): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userRole", role);
  }
};

const clearUserRole = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userRole");
  }
};
// ----------------------
// Refresh token logic
// ----------------------
const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = new Promise(async (resolve, reject) => {
    try {
      const response = await client.post<{
        data: { accessToken: string; success?: boolean | undefined };
      }>(
        "/auth/refresh-token",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const { accessToken } = response.data.data;
      setAccessToken(accessToken);
      resolve(accessToken);
    } catch (error) {
      reject(error);
    } finally {
      refreshPromise = null;
    }
  });

  return refreshPromise;
};
// ----------------------
// Axios interceptors
// ----------------------
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure Content-Type is set for POST/PUT/PATCH requests
    if (
      config.data &&
      (config.method === "post" ||
        config.method === "put" ||
        config.method === "patch")
    ) {
      // Use set method to avoid TypeScript errors
      config.headers.set("Content-Type", "application/json", true);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (originalRequest?.url === "/auth/refresh-token") {
        return Promise.reject(error);
      }

      if (originalRequest) {
        originalRequest._retry = true;

        try {
          const newAccessToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Response type interfaces
interface RegisterResponse {
  success: boolean;
  data: {
    tempUserId: string;
    success?: boolean;
  };
  message: string;
}

interface VerifyRegistrationResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
  message: string;
}

interface ResendOTPResponse {
  success: boolean;
  data: {
    tempUserId: string;
  };
  message: string;
}

interface VerifyEmailResponse {
  success: boolean;
  data: {
    user?: User;
  };
  message: string;
}

// ----------------------
// API functions
// ----------------------
export const api = {
  register: (data: RegisterData): Promise<AxiosResponse<RegisterResponse>> =>
    client.post<RegisterResponse>("/auth/register", data),

  login: async (
    data: LoginCredentials
  ): Promise<AxiosResponse<AuthResponse>> => {
    const response = await client.post<AuthResponse>("/auth/login", data);
    const { accessToken, user } = response.data.data.tokens;
    setAccessToken(accessToken); // Store user role if available
    if (user?.role) {
      setUserRole(user.role);
    }
    return response;
  },

  logout: async (): Promise<
    AxiosResponse<{ success: boolean; message: string }>
  > => {
    const response = await client.post<{ success: boolean; message: string }>(
      "/auth/logout",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    clearTokens();
    clearUserRole();
    return response;
  },

  getGoogleAuthUrl: (
    state?: string
  ): Promise<
    AxiosResponse<{
      success: boolean;
      data: { url: string };
    }>
  > => {
    const params = state ? { params: { state } } : {};
    return client.get<{
      success: boolean;
      data: { url: string };
    }>("/auth/google/url", params);
  },

  // googleCallback: async (
  //   code: string,
  //   state?: string
  // ): Promise<AxiosResponse<AuthResponse>> => {
  //   const response = await client.post<AuthResponse>("/auth/google/callback", {
  //     code,
  //     state,
  //   });
  //   const { accessToken } = response.data.data.tokens;
  //   setAccessToken(accessToken);
  //   return response;
  // },
  // Add better error handling for Google calls
  googleCallback: async (
    code: string,
    state?: string
  ): Promise<AxiosResponse<AuthResponse>> => {
    try {
      const response = await client.post<AuthResponse>(
        "/auth/google/callback",
        {
          code,
          state,
        }
      );
      const { accessToken, user } = response.data.data.tokens;
      setAccessToken(accessToken); // Store user role if available
      if (user?.role) {
        setUserRole(user.role);
      }
      return response;
    } catch (error) {
      // Clear tokens if Google auth fails
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        clearTokens();
        clearUserRole();
      }
      throw error;
    }
  },

  sendVerificationOTP: (
    email: string
  ): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    client.post<{ success: boolean; message: string }>(
      "/auth/send-verification-otp",
      { email }
    ),

  verifyEmailOTP: (
    email: string,
    otp: string
  ): Promise<AxiosResponse<VerifyEmailResponse>> =>
    client.post<VerifyEmailResponse>("/auth/verify-email-otp", { email, otp }),

  verifyRegistrationOTP: (
    tempUserId: string,
    otp: string
  ): Promise<AxiosResponse<VerifyRegistrationResponse>> =>
    client.post<VerifyRegistrationResponse>("/auth/verify-registration-otp", {
      tempUserId,
      otp,
    }),

  resendRegistrationOTP: (
    tempUserId: string
  ): Promise<AxiosResponse<ResendOTPResponse>> =>
    client.post<ResendOTPResponse>("/auth/resend-registration-otp", {
      tempUserId,
    }),

  forgotPassword: (
    email: string
  ): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    client.post<{ success: boolean; message: string }>(
      "/auth/forgot-password",
      { email }
    ),

  resetPasswordOTP: (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    client.post<{ success: boolean; message: string }>(
      "/auth/reset-password-otp",
      { email, otp, newPassword }
    ),

  getProfile: (): Promise<AxiosResponse<{ success: boolean; data: User }>> =>
    client.get<{ success: boolean; data: User }>("/auth/me"),

  updateProfile: (data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    address: string;
    bio: string;
    preferences: Record<string, unknown>;
    pushSubscription?: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string };
  }>): Promise<AxiosResponse<{ success: boolean; data: User; message: string }>> =>
    client.put<{ success: boolean; data: User; message: string }>("/v1/users/profile", data),

  validateToken: async (): Promise<
    AxiosResponse<{ success: boolean; data: { isValid: boolean; user?: User } }>
  > => {
    const response = await client.get<{
      success: boolean;
      data: { isValid: boolean; user?: User };
    }>("/auth/validate-token");
    if (response.data.data.user) {
      if (typeof window !== "undefined" && response.data.data.user.role) {
        localStorage.setItem("userRole", response.data.data.user.role);
      }
      if (response.data.data.user?.role) {
        setUserRole(response.data.data.user.role);
      }
    }
    return response;
  },

  // client.ts
  request: async <T = unknown>(
    config: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return client.request<ApiResponse<T>>(config);
  },

  get: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.request<T>({ ...config, method: "GET", url });
  },

  post: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.request<T>({ ...config, method: "POST", url, data });
  },

  put: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.request<T>({ ...config, method: "PUT", url, data });
  },

  delete: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.request<T>({ ...config, method: "DELETE", url });
  },

  patch: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.request<T>({ ...config, method: "PATCH", url, data });
  },
};
export { clearUserRole, getUserRole, setUserRole };
export const apiClient = api;
