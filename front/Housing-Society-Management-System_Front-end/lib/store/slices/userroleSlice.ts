// src/lib/store/slices/userroleSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserRoleState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    isActive?: boolean;
  };
}

const initialState: UserRoleState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "priority",
    sortOrder: "desc",
  },
};

const userRoleSlice = createSlice({
  name: "userRoles",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<UserRoleState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = userRoleSlice.actions;
export default userRoleSlice.reducer;
