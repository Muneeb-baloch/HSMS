// import { useToast } from "@/components/context/ToastContext";
// import { useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { useCallback, useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { apiClient } from "../API/client";
// import { logout, setTokens, setUser } from "../store/slices/authSlice";
// import { AppDispatch, RootState } from "../store/store";
// import { User } from "../types/auth";

// interface ValidateTokenResponse {
//   success: boolean;
//   data: {
//     isValid: boolean;
//     user?: User;
//   };
//   message?: string;
// }

// export const useAuth = (redirectTo?: string) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { showToast } = useToast();
//   const router = useRouter();

//   const {
//     user,
//     isAuthenticated,
//     isLoading: reduxLoading,
//     tokens,
//   } = useSelector((state: RootState) => state.auth);

//   const [isInitialized, setIsInitialized] = useState(false);
//   const [shouldValidate, setShouldValidate] = useState(false);

//   // Function to validate token
//   const validateToken = useCallback(async () => {
//     try {
//       console.log("Validating token...");
//       const response = await apiClient.validateToken();
//       const data = response.data as ValidateTokenResponse;

//       if (data.success && data.data.isValid) {
//         if (data.data.user) {
//           dispatch(setUser(data.data.user));
//         }
//         return { isValid: true, user: data.data.user };
//       } else {
//         throw new Error(data.message || "Token validation failed");
//       }
//     } catch (error: unknown) {
//       console.error("Token validation error:", error);
//       dispatch(logout());

//       if (error instanceof Error) {
//         showToast(error.message, "error");
//       } else {
//         showToast("Session expired. Please login again.", "warning");
//       }

//       return { isValid: false, user: null };
//     }
//   }, [dispatch, showToast]);

//   // Check auth status on mount
//   useEffect(() => {
//     const initializeAuth = async () => {
//       if (isInitialized) return;

//       const token = localStorage.getItem("accessToken");
//       const storedUser = localStorage.getItem("user");
//       const storedTokens = localStorage.getItem("tokens");

//       // Case 1: Token exists but Redux state is empty
//       if (token && !isAuthenticated) {
//         try {
//           // If we have stored data, set it immediately for better UX
//           if (storedUser) {
//             try {
//               const userData = JSON.parse(storedUser);
//               dispatch(setUser(userData));
//             } catch (e) {
//               console.error("Error parsing stored user:", e);
//             }
//           }

//           if (storedTokens) {
//             try {
//               const tokensData = JSON.parse(storedTokens);
//               dispatch(setTokens(tokensData));
//             } catch (e) {
//               console.error("Error parsing stored tokens:", e);
//             }
//           }

//           // Validate token in background
//           const result = await validateToken();

//           if (!result.isValid && redirectTo) {
//             router.push(redirectTo);
//           }
//         } catch (error) {
//           console.error("Auth initialization error:", error);
//           if (redirectTo) {
//             router.push(redirectTo);
//           }
//         }
//       }
//       // Case 2: No token but Redux says authenticated (inconsistent state)
//       else if (!token && isAuthenticated) {
//         dispatch(logout());
//         if (redirectTo) {
//           router.push(redirectTo);
//         }
//       }
//       // Case 3: No token, not authenticated
//       else if (!token && !isAuthenticated && redirectTo) {
//         router.push(redirectTo);
//       }

//       setIsInitialized(true);
//     };

//     // Use setTimeout to avoid synchronous state updates
//     const timer = setTimeout(() => {
//       initializeAuth();
//     }, 0);

//     return () => clearTimeout(timer);
//   }, [
//     isAuthenticated,
//     isInitialized,
//     validateToken,
//     dispatch,
//     router,
//     redirectTo,
//   ]);

//   // Query for token validation (only runs when needed)
//   const { isLoading: queryLoading, error } = useQuery({
//     queryKey: ["validate-token", isAuthenticated],
//     queryFn: validateToken,
//     enabled: shouldValidate && isAuthenticated && !reduxLoading,
//     retry: false,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   // Set validation trigger based on conditions
//   useEffect(() => {
//     if (isAuthenticated && !user && isInitialized) {
//       setShouldValidate(true);
//     } else {
//       setShouldValidate(false);
//     }
//   }, [isAuthenticated, user, isInitialized]);

//   const isLoading = reduxLoading || queryLoading || !isInitialized;

//   return {
//     user,
//     isAuthenticated:
//       isAuthenticated ||
//       (typeof window !== "undefined" && !!localStorage.getItem("accessToken")),
//     isLoading,
//     error: error instanceof Error ? error.message : null,
//     tokens,
//     isInitialized,
//   };
// };

// // Simpler hook for just checking auth status (no redirects)
// export const useAuthStatus = () => {
//   const { isAuthenticated, isLoading, user } = useSelector(
//     (state: RootState) => state.auth
//   );

//   const hasToken =
//     typeof window !== "undefined"
//       ? !!localStorage.getItem("accessToken")
//       : false;

//   return {
//     isAuthenticated: isAuthenticated || hasToken,
//     isLoading,
//     user,
//   };
// };
import { useToast } from "@/components/context/ToastContext";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiClient } from "../API/client";
import { logout, setPermissions, setTokens, setUser } from "../store/slices/authSlice";
import { AppDispatch, RootState } from "../store/store";
import { PermissionsMap, User } from "../types/auth";

interface ValidateTokenResponse {
  success: boolean;
  data: {
    isValid: boolean;
    user?: User;
    permissions?: PermissionsMap;
  };
  message?: string;
}

export const useAuth = (redirectTo?: string) => {
  const dispatch = useDispatch<AppDispatch>();

  const { showToast } = useToast();
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: reduxLoading,
    tokens,
  } = useSelector((state: RootState) => state.auth);

  const [isInitialized, setIsInitialized] = useState(false);
  const [hasToken, setHasToken] = useState(false); // ✅ NEW
  // Function to validate token
  const validateToken = useCallback(async () => {
    try {
      const response = await apiClient.validateToken();
      const data = response.data as ValidateTokenResponse;

      if (data.success && data.data.isValid) {
        if (data.data.user) {
          dispatch(setUser(data.data.user));

          // Fetch permissions for the user's role if not already provided
          if (data.data.permissions) {
            dispatch(setPermissions(data.data.permissions));
          } else if (data.data.user.roleId) {
            try {
              const permResponse = await apiClient.get<{ permissionsMap: PermissionsMap }>(
                `/permission/role/${data.data.user.roleId}/map`
              );
              if (permResponse.data?.data?.permissionsMap) {
                dispatch(setPermissions(permResponse.data.data.permissionsMap));
              }
            } catch (permError) {
              console.warn("Failed to fetch permissions:", permError);
            }
          }
        }
        return { isValid: true, user: data.data.user };
      } else {
        return { isValid: false, user: null };
      }
    } catch (error: unknown) {
      console.error("Token validation error:", error);
      dispatch(logout());

      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("Session expired. Please login again.", "warning");
      }

      return { isValid: false, user: null };
    }
  }, [dispatch, showToast]);

  // Check auth status on mount - SIMPLIFIED
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;

      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      const storedTokens = localStorage.getItem("tokens");
      setHasToken(!!token); // ✅ SAFE STATE
      // If token exists but Redux is not authenticated, validate it
      if (token && !isAuthenticated) {
        try {
          // Set stored data immediately for UX
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              dispatch(setUser(userData));
            } catch (e) {
              console.error("Error parsing stored user:", e);
            }
          }

          if (storedTokens) {
            try {
              const tokensData = JSON.parse(storedTokens);
              dispatch(setTokens(tokensData));
            } catch (e) {
              console.error("Error parsing stored tokens:", e);
            }
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
        }
      }

      // Mark as initialized
      setIsInitialized(true);
    };

    initializeAuth();
  }, [isAuthenticated, isInitialized, dispatch]);
  // lib/hooks/useAuth.ts میں useEffect کو update کریں
  // useEffect(() => {
  //   const initializeAuth = async () => {
  //     if (isInitialized) return;

  //     const token = localStorage.getItem("accessToken");
  //     setHasToken(!!token);

  //     // If token exists, validate it
  //     if (token && !isAuthenticated) {
  //       try {
  //         // Validate token
  //         const result = await validateToken();

  //         if (result.isValid) {
  //           // Token is valid, user should be authenticated
  //           // The validateToken function already dispatches setUser
  //         } else {
  //           // Token is invalid, redirect to login if needed
  //           if (redirectTo) {
  //             router.push(redirectTo);
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Auth initialization error:", error);
  //         if (redirectTo) {
  //           router.push(redirectTo);
  //         }
  //       }
  //     }

  //     setIsInitialized(true);
  //   };

  //   initializeAuth();
  // }, [
  //   isAuthenticated,
  //   isInitialized,
  //   dispatch,
  //   redirectTo,
  //   router,
  //   validateToken,
  // ]);
  // Query for token validation
  const { isLoading: queryLoading, error } = useQuery({
    queryKey: ["validate-token"],
    queryFn: validateToken,
    enabled: hasToken && isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = reduxLoading || queryLoading || !isInitialized;

  return {
    user,
    isAuthenticated:
      isAuthenticated || (typeof window !== "undefined" && hasToken),
    isLoading,
    error: error instanceof Error ? error.message : null,
    tokens,
    isInitialized,
  };
};

export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state: RootState) => state.auth
  );

  const hasToken =
    typeof window !== "undefined"
      ? !!localStorage.getItem("accessToken")
      : false;

  return {
    isAuthenticated: isAuthenticated || hasToken,
    isLoading,
    user,
  };
};
