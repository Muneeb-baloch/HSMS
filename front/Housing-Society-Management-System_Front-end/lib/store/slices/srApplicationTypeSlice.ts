// src/lib/store/slices/srApplicationTypeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SrApplicationTypeState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const initialState: SrApplicationTypeState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const srApplicationTypeSlice = createSlice({
  name: "srApplicationTypes",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<SrApplicationTypeState["filters"]>>,
    ) => {
      // Merge filters
      state.filters = { ...state.filters, ...action.payload };

      // Remove undefined values
      Object.keys(state.filters).forEach((key) => {
        if ((state.filters as any)[key] === undefined) {
          delete (state.filters as any)[key];
        }
      });
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
  },
});

export const { setFilters, resetFilters } = srApplicationTypeSlice.actions;
export default srApplicationTypeSlice.reducer;
