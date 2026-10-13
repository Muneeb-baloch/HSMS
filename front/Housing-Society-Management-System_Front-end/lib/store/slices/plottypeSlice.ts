// src/lib/store/slices/plottypeSlice.ts
import { PlotTypeQueryParams } from "@/lib/types/plottypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlotTypeState {
  filters: PlotTypeQueryParams;
}

const initialState: PlotTypeState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const plotTypeSlice = createSlice({
  name: "plotTypes",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<PlotTypeQueryParams>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = plotTypeSlice.actions;
export default plotTypeSlice.reducer;
