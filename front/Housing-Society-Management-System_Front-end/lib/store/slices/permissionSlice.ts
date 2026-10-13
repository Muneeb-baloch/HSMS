import {
  UserPermission,
  UserPermissionQueryParams,
} from "@/lib/types/permissions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PermissionState {
  items: UserPermission[];
  selectedItem: UserPermission | null;
  filters: UserPermissionQueryParams;
  total: number;
  pages: number;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  summary: {
    totalPermissions: number;
    activePermissions: number;
    byAccessType: Record<string, number>;
  };
}

const initialState: PermissionState = {
  items: [],
  selectedItem: null,
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  total: 0,
  pages: 0,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  summary: {
    totalPermissions: 0,
    activePermissions: 0,
    byAccessType: {},
  },
};

const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    // List operations
    setPermissions: (state, action: PayloadAction<UserPermission[]>) => {
      state.items = action.payload;
    },

    setSummary: (
      state,
      action: PayloadAction<{
        totalPermissions: number;
        activePermissions: number;
        byAccessType: Record<string, number>;
      }>,
    ) => {
      state.summary = action.payload;
    },

    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },

    setPages: (state, action: PayloadAction<number>) => {
      state.pages = action.payload;
    },

    // CRUD operations
    addPermission: (state, action: PayloadAction<UserPermission>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },

    updatePermission: (state, action: PayloadAction<UserPermission>) => {
      const index = state.items.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    removePermission: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },

    // Selection
    setSelectedPermission: (
      state,
      action: PayloadAction<UserPermission | null>,
    ) => {
      state.selectedItem = action.payload;
    },

    // Filters
    setFilters: (
      state,
      action: PayloadAction<Partial<UserPermissionQueryParams>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      if (
        action.payload.search !== undefined ||
        action.payload.roleId !== undefined ||
        action.payload.srModuleId !== undefined ||
        action.payload.isActive !== undefined
      ) {
        state.filters.page = 1;
      }
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setCreating: (state, action: PayloadAction<boolean>) => {
      state.isCreating = action.payload;
    },

    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },

    setDeleting: (state, action: PayloadAction<boolean>) => {
      state.isDeleting = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear all
    clearPermissions: (state) => {
      state.items = [];
      state.total = 0;
      state.selectedItem = null;
      state.error = null;
    },
  },
});

export const {
  setPermissions,
  setSummary,
  setTotal,
  setPages,
  addPermission,
  updatePermission,
  removePermission,
  setSelectedPermission,
  setFilters,
  resetFilters,
  setLoading,
  setCreating,
  setUpdating,
  setDeleting,
  setError,
  clearPermissions,
} = permissionSlice.actions;

export default permissionSlice.reducer;
