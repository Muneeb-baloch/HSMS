// src/lib/store/slices/plotcategorySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlotCategoryState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    isActive?: boolean;
    surchargeType?: "percentage" | "fixed" | "none";
  };
}

const initialState: PlotCategoryState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "categoryName",
    sortOrder: "asc",
  },
};

const plotCategorySlice = createSlice({
  name: "plotCategories",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<PlotCategoryState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = plotCategorySlice.actions;
export default plotCategorySlice.reducer;
