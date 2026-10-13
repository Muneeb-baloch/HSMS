// src/lib/store/slices/plotsizeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlotSizeState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    minPrice?: number;
    maxPrice?: number;
    areaUnit?: string;
    minArea?: number;
    maxArea?: number;
  };
}

const initialState: PlotSizeState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "totalArea",
    sortOrder: "asc",
  },
};

const plotSizeSlice = createSlice({
  name: "plotSizes",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<PlotSizeState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = plotSizeSlice.actions;
export default plotSizeSlice.reducer;
