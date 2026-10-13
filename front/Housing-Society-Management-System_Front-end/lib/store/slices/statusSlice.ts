// src/lib/store/slices/statusSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StatusState {
  filters: {
    page: number;
    limit: number;
    search: string;
    searchFields?: string[];
    statusId?: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const initialState: StatusState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "statusName",
    sortOrder: "asc",
  },
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<StatusState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = statusSlice.actions;
export default statusSlice.reducer;
