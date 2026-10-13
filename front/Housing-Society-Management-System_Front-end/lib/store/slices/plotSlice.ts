// src/lib/store/slices/plotSlice.ts
import { PlotType } from "@/lib/types/plot";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlotState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    projectId?: string;
    plotBlockId?: string;
    plotType?: PlotType[];
    salesStatusId?: string[];
    isAvailable?: boolean;
    isPossessionReady?: boolean;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
  };
}

const initialState: PlotState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "plotNo",
    sortOrder: "asc",
  },
};

const plotSlice = createSlice({
  name: "plots",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<PlotState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = plotSlice.actions;
export default plotSlice.reducer;
