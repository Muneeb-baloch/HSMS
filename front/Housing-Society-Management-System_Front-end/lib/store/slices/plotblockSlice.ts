import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlotBlockState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const initialState: PlotBlockState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const plotBlockSlice = createSlice({
  name: "plotBlocks",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<PlotBlockState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = plotBlockSlice.actions;
export default plotBlockSlice.reducer;
