import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import axios from "axios";
import { AuthTokens, PermissionsMap, User } from "../../types/auth";
import { apiClient } from "@/lib/API/client";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  permissions: PermissionsMap | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenValidationLoading: boolean;
}

interface ValidateTokenResponse {
  isValid: boolean;
  user?: User;
}

const loadInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      user: null,
      tokens: null,
      permissions: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokenValidationLoading: false,
    };
  }

  const savedUser = localStorage.getItem("user");
  const savedTokens = localStorage.getItem("tokens");
  const savedPermissions = localStorage.getItem("permissions");

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    tokens: savedTokens ? JSON.parse(savedTokens) : null,
    permissions: savedPermissions ? JSON.parse(savedPermissions) : null,
    isAuthenticated: !!savedUser,
    isLoading: false,
    error: null,
    tokenValidationLoading: false,
  };
};

const initialState: AuthState = loadInitialState();

// Async thunk for token validation
export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.validateToken();

      if (response.data.success && response.data.data.isValid) {
        const result: ValidateTokenResponse = {
          isValid: true,
          user: response.data.data.user,
        };

        if (response.data.data.user) {
          // Update user data if available
          dispatch(setUser(response.data.data.user));
        }
        return result;
      } else {
        // Clear auth if token is invalid
        dispatch(logout());
        return rejectWithValue("Token is invalid");
      }
    } catch (error: unknown) {
      console.error("Token validation error:", error);
      dispatch(logout());

      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Token validation failed"
        );
      }

      return rejectWithValue("Token validation failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("tokens", JSON.stringify(action.payload));
        localStorage.setItem("accessToken", action.payload.accessToken);
      }
    },
    setPermissions: (state, action: PayloadAction<PermissionsMap>) => {
      state.permissions = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("permissions", JSON.stringify(action.payload));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.permissions = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      state.tokenValidationLoading = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("tokens");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("permissions");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateToken.pending, (state) => {
        state.tokenValidationLoading = true;
        state.error = null;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.tokenValidationLoading = false;
        state.isAuthenticated = true;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.tokenValidationLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = null;
        state.permissions = null;
        state.error = (action.payload as string) || "Token validation failed";

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("tokens");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("permissions");
        }
      });
  },
});

export const { setUser, setTokens, setPermissions, setLoading, setError, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
