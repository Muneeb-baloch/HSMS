// src/lib/store/slices/citySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CityState {
  filters: {
    page: number;
    limit: number;
    search: string;
    searchFields?: string[];
    stateId?: string;
    statusId?: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const initialState: CityState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "cityName",
    sortOrder: "asc",
  },
};

const citySlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<CityState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = citySlice.actions;
export default citySlice.reducer;
