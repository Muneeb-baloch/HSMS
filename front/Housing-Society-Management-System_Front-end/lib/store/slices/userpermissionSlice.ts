// src/lib/store/slices/userpermissionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserPermissionState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    srModuleId?: string;
    roleId?: string;
    isActive?: boolean;
    hasAccess?: boolean;
  };
}

const initialState: UserPermissionState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const userPermissionSlice = createSlice({
  name: "userPermissions",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<UserPermissionState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = userPermissionSlice.actions;
export default userPermissionSlice.reducer;
