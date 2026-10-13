// // lib/hooks/useGoogleAuth.ts - FIXED VERSION

// interface GoogleCallbackData {
//   code: string;
//   state?: string;
// }

// interface GoogleAuthUrlResponse {
//   success: boolean;
//   data: {
//     url: string;
//   };
// }

// interface GoogleAuthResponse extends AuthResponse {
//   data: {
//     user: User;
//     tokens: AuthTokens;
//     isNewUser?: boolean;
//   };
// }

// export const useGoogleAuth = () => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { showToast } = useToast();

//   const getAuthUrl = useMutation({
//     mutationFn: async (state?: string): Promise<string> => {
//       try {
//         const response = await apiClient.getGoogleAuthUrl(state);
//         const responseData = response.data as GoogleAuthUrlResponse;

//         console.log("Google Auth URL Response:", responseData);

//         if (responseData.success && responseData.data?.url) {
//           return responseData.data.url;
//         } else {
//           throw new Error(
//             "Invalid response structure from Google auth endpoint"
//           );
//         }
//       } catch (error) {
//         console.error("Error getting Google auth URL:", error);
//         throw error;
//       }
//     },
//     onError: (error: unknown) => {
//       let errorMessage = "Failed to initiate Google login";
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }
//       showToast(errorMessage, "error");
//     },
//   });

//   const callback = useMutation({
//     mutationFn: async ({ code, state }: GoogleCallbackData) => {
//       // Check if we're already processing this code
//       const processingKey = `google-processing-${code}`;
//       if (
//         typeof window !== "undefined" &&
//         localStorage.getItem(processingKey)
//       ) {
//         throw new Error("Authorization already in progress");
//       }

//       // Mark as processing
//       if (typeof window !== "undefined") {
//         localStorage.setItem(processingKey, "true");
//         // Auto-remove after 2 minutes
//         setTimeout(() => {
//           localStorage.removeItem(processingKey);
//         }, 2 * 60 * 1000);
//       }

//       try {
//         const response = await apiClient.googleCallback(code, state);
//         return response.data as GoogleAuthResponse;
//       } finally {
//         // Clean up processing flag
//         if (typeof window !== "undefined") {
//           localStorage.removeItem(processingKey);
//         }
//       }
//     }, // mutationFn: async ({ code, state }: GoogleCallbackData) => {
//     //   const response = await apiClient.googleCallback(code, state);
//     //   return response.data as GoogleAuthResponse;
//     // },
//     // Update the onSuccess handler
//     onSuccess: (data: GoogleAuthResponse) => {
//       console.log("Google authentication successful:", data);

//       if (data.success && data.data) {
//         // 1. Save to localStorage FIRST
//         if (typeof window !== "undefined") {
//           localStorage.setItem("accessToken", data.data.tokens.accessToken);
//           localStorage.setItem("user", JSON.stringify(data.data.user));
//           localStorage.setItem("tokens", JSON.stringify(data.data.tokens));
//         }

//         // 2. Force Redux state update
//         dispatch(setUser(data.data.user));
//         dispatch(setTokens(data.data.tokens));

//         // 3. Force a state sync and redirect
//         setTimeout(() => {
//           // Force page reload to ensure all states are synchronized
//           if (data.data.isNewUser) {
//             window.location.href = "/dashboard?newUser=true";
//           } else {
//             window.location.href = "/dashboard";
//           }
//         }, 100);
//       }
//     },
//     onError: (error: ApiError) => {
//       let errorMessage = "Google authentication failed";
//       if (typeof error === "object" && error !== null && "response" in error) {
//         const axiosError = error as object & {
//           response?: { data?: { error?: string } };
//         };
//         errorMessage = axiosError.response?.data?.error || errorMessage;
//       } else if (error instanceof Error) {
//         errorMessage = error.message;
//       }
//       showToast(errorMessage, "error");
//       dispatch(setError(errorMessage));
//     },
//   });

//   const initiateGoogleLogin = (state?: string) => {
//     getAuthUrl.mutate(state, {
//       onSuccess: (url: string) => {
//         if (!url || url === "undefined") {
//           showToast("Google authentication URL is missing", "error");
//           console.error("Invalid Google URL received:", url);
//           return;
//         }

//         if (typeof url !== "string") {
//           console.error("URL is not a string:", typeof url, url);
//           showToast("Invalid authentication URL", "error");
//           return;
//         }

//         const trimmedUrl = url.trim();
//         if (!trimmedUrl.startsWith("https://accounts.google.com/")) {
//           console.error("URL does not start with Google domain:", trimmedUrl);
//           showToast("Invalid Google authentication URL", "error");
//           return;
//         }

//         console.log("Redirecting to Google OAuth:", trimmedUrl);
//         window.location.href = trimmedUrl;
//       },
//       onError: (error) => {
//         console.error("Failed to get Google auth URL:", error);
//       },
//     });
//   };

//   const handleGoogleCallback = (code: string, state?: string) => {
//     callback.mutate({ code, state });
//   };

//   return {
//     getAuthUrl,
//     callback,
//     initiateGoogleLogin,
//     handleGoogleCallback,
//     isLoading: getAuthUrl.isPending || callback.isPending,
//     isGoogleLoading: getAuthUrl.isPending,
//   };
// };
// lib/hooks/useGoogleAuth.ts - FIXED VERSION

// interface GoogleCallbackData {
//   code: string;
//   state?: string;
// }

// interface GoogleAuthUrlResponse {
//   success: boolean;
//   data: {
//     url: string;
//   };
// }

// interface GoogleAuthResponse extends AuthResponse {
//   data: {
//     user: User;
//     tokens: AuthTokens;
//     isNewUser?: boolean;
//   };
// }

// export const useGoogleAuth = () => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { showToast } = useToast();

//   const getAuthUrl = useMutation({
//     mutationFn: async (state?: string): Promise<string> => {
//       try {
//         const response = await apiClient.getGoogleAuthUrl(state);
//         const responseData = response.data as GoogleAuthUrlResponse;

//         if (responseData.success && responseData.data?.url) {
//           return responseData.data.url;
//         } else {
//           throw new Error("Invalid response from Google auth endpoint");
//         }
//       } catch (error) {
//         console.error("Error getting Google auth URL:", error);
//         throw error;
//       }
//     },
//     onError: (error: unknown) => {
//       let errorMessage = "Failed to initiate Google login";
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }
//       showToast(errorMessage, "error");
//     },
//   });

//   const callback = useMutation({
//     mutationFn: async ({ code, state }: GoogleCallbackData) => {
//       // Check if already processing
//       const processingKey = `google-processing-${code}`;
//       if (
//         typeof window !== "undefined" &&
//         localStorage.getItem(processingKey)
//       ) {
//         throw new Error("Authorization already in progress");
//       }

//       // Mark as processing
//       if (typeof window !== "undefined") {
//         localStorage.setItem(processingKey, "true");
//         setTimeout(() => {
//           localStorage.removeItem(processingKey);
//         }, 2 * 60 * 1000);
//       }

//       try {
//         const response = await apiClient.googleCallback(code, state);
//         return response.data as GoogleAuthResponse;
//       } finally {
//         if (typeof window !== "undefined") {
//           localStorage.removeItem(processingKey);
//         }
//       }
//     },
//     // onSuccess: (data: GoogleAuthResponse) => {
//     //   console.log("Google authentication successful:", data);

//     //   if (data.success && data.data) {
//     //     // Save to localStorage
//     //     if (typeof window !== "undefined") {
//     //       localStorage.setItem("accessToken", data.data.tokens.accessToken);
//     //       localStorage.setItem("user", JSON.stringify(data.data.user));
//     //       localStorage.setItem("tokens", JSON.stringify(data.data.tokens));
//     //     }

//     //     // Update Redux state
//     //     dispatch(setUser(data.data.user));
//     //     dispatch(setTokens(data.data.tokens));

//     //     // ✅ IMPORTANT: Dispatch an action to mark as authenticated
//     //     dispatch(setLoading(false));

//     //     // Show success message
//     //     showToast("Google login successful! Redirecting...", "success");

//     //     // ✅ Force a navigation to ensure ProtectedRoute re-evaluates
//     //     setTimeout(() => {
//     //       // Use window.location.href instead of router.push to ensure full page reload
//     //       window.location.href = "/dashboard";
//     //     }, 1000);
//     //   }

//     onSuccess: (data: GoogleAuthResponse) => {
//       console.log("Google authentication successful:", data);

//       if (data.success && data.data) {
//         // Save to localStorage
//         if (typeof window !== "undefined") {
//           localStorage.setItem("accessToken", data.data.tokens.accessToken);
//           localStorage.setItem("user", JSON.stringify(data.data.user));
//           localStorage.setItem("tokens", JSON.stringify(data.data.tokens));
//         }

//         // Update Redux state
//         dispatch(setUser(data.data.user));
//         dispatch(setTokens(data.data.tokens));

//         // Show success message
//         showToast("Google login successful! Redirecting...", "success");

//         // Simple redirect - let ProtectedRoute handle the rest
//         setTimeout(() => {
//           router.push("/dashboard");
//         }, 500);
//       }
//     },
//     onError: (error: ApiError) => {
//       let errorMessage = "Google authentication failed";
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }
//       showToast(errorMessage, "error");
//       dispatch(setError(errorMessage));
//     },
//   });

//   const initiateGoogleLogin = (state?: string) => {
//     getAuthUrl.mutate(state, {
//       onSuccess: (url: string) => {
//         if (!url || typeof url !== "string" || !url.startsWith("https://")) {
//           showToast("Invalid authentication URL", "error");
//           return;
//         }
//         console.log("Redirecting to Google OAuth");
//         window.location.href = url;
//       },
//       onError: (error) => {
//         console.error("Failed to get Google auth URL:", error);
//       },
//     });
//   };

//   const handleGoogleCallback = (code: string, state?: string) => {
//     callback.mutate({ code, state });
//   };

//   return {
//     getAuthUrl,
//     callback,
//     initiateGoogleLogin,
//     handleGoogleCallback,
//     isLoading: getAuthUrl.isPending || callback.isPending,
//     isGoogleLoading: getAuthUrl.isPending,
//   };
// };

// src/lib/hooks/useGoogleAuth.ts
import { useToast } from "@/components/context/ToastContext";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setTokens, setUser } from "../../lib/store/slices/authSlice";
import { AuthResponse, AuthTokens, User } from "../../lib/types/auth";
import { apiClient } from "../API/client";
import { ApiError } from "../types/api";

interface GoogleCallbackData {
  code: string;
  state?: string;
}

interface GoogleAuthUrlResponse {
  success: boolean;
  data: {
    url: string;
  };
}

interface GoogleAuthResponse extends AuthResponse {
  data: {
    user: User;
    tokens: AuthTokens;
    isNewUser?: boolean;
  };
}

export const useGoogleAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { showToast } = useToast();

  const getAuthUrl = useMutation({
    mutationFn: async (state?: string): Promise<string> => {
      try {
        const response = await apiClient.getGoogleAuthUrl(state);
        const responseData = response.data as GoogleAuthUrlResponse;

        if (responseData.success && responseData.data?.url) {
          return responseData.data.url;
        } else {
          throw new Error("Invalid response from Google auth endpoint");
        }
      } catch (error) {
        console.error("Error getting Google auth URL:", error);
        throw error;
      }
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to initiate Google login";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
    },
  });

  const callback = useMutation({
    mutationFn: async ({ code, state }: GoogleCallbackData) => {
      // Check if already processing
      const processingKey = `google-processing-${code}`;
      if (
        typeof window !== "undefined" &&
        localStorage.getItem(processingKey)
      ) {
        throw new Error("Authorization already in progress");
      }

      // Mark as processing
      if (typeof window !== "undefined") {
        localStorage.setItem(processingKey, "true");
        setTimeout(
          () => {
            localStorage.removeItem(processingKey);
          },
          2 * 60 * 1000,
        );
      }

      try {
        const response = await apiClient.googleCallback(code, state);
        return response.data as GoogleAuthResponse;
      } finally {
        if (typeof window !== "undefined") {
          localStorage.removeItem(processingKey);
        }
      }
    },
    onSuccess: (data: GoogleAuthResponse) => {
      if (data.success && data.data) {
        // Extract data
        const { user, tokens } = data.data;

        // 1. Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", tokens.accessToken);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("tokens", JSON.stringify(tokens));

          // Save user role separately for quick access
          if (user.role) {
            localStorage.setItem("userRole", user.role);
          }
        }

        // 2. Dispatch to Redux
        dispatch(setUser(user));
        dispatch(setTokens(tokens));

        // 3. Show success message
        showToast("Google login successful!", "success");

        // 4. IMPORTANT: Force a small delay then redirect
        setTimeout(() => {
          // Check if user has permission for dashboard
          const hasPermission =
            user.role &&
            (user.role === "user" ||
              user.role === "moderator" ||
              user.role === "admin" ||
              user.role === "super_admin");

          if (hasPermission) {
            // Force full page reload to ensure auth state is properly loaded
            window.location.href = "/dashboard";
          } else {
            // If no permission, redirect to unauthorized page
            window.location.href = "/unauthorized";
          }
        }, 500);
      }
    },
    onError: (error: ApiError) => {
      console.error("Google auth error:", error);

      let errorMessage = "Google authentication failed";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }

      showToast(errorMessage, "error");

      // Clear any existing auth data on error
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("tokens");
        localStorage.removeItem("userRole");
      }

      // Redirect back to login
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    },
  });

  const initiateGoogleLogin = (state?: string) => {
    getAuthUrl.mutate(state, {
      onSuccess: (url: string) => {
        if (!url || typeof url !== "string" || !url.startsWith("https://")) {
          showToast("Invalid authentication URL", "error");
          return;
        }
        window.location.href = url;
      },
      onError: (error) => {
        console.error("Failed to get Google auth URL:", error);
        showToast("Failed to start Google login", "error");
      },
    });
  };

  const handleGoogleCallback = (code: string, state?: string) => {
    callback.mutate({ code, state });
  };

  return {
    getAuthUrl,
    callback,
    initiateGoogleLogin,
    handleGoogleCallback,
    isLoading: getAuthUrl.isPending || callback.isPending,
    isGoogleLoading: getAuthUrl.isPending,
  };
};
