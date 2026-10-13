// src/lib/store/slices/userStaffSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserStaffState {
  filters: {
    page: number;
    limit: number;
    search: string;
    roleId: string;
    cityId: string;
    designation: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    isActive?: boolean;
  };
}

const initialState: UserStaffState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    roleId: "",
    cityId: "",
    designation: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const userStaffSlice = createSlice({
  name: "userStaff",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<UserStaffState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = userStaffSlice.actions;
export default userStaffSlice.reducer;
