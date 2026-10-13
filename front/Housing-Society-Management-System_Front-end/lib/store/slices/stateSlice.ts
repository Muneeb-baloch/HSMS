// src/lib/store/slices/stateSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StateState {
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

const initialState: StateState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "stateName",
    sortOrder: "asc",
  },
};

const stateSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<StateState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = stateSlice.actions;
export default stateSlice.reducer;
