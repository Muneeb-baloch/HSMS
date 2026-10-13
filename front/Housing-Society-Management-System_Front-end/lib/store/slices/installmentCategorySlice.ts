// src/lib/store/slices/installmentCategorySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InstallmentCategoryState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    isRefundable?: boolean;
    isMandatory?: boolean;
    isActive?: boolean;
  };
}

const initialState: InstallmentCategoryState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "sequenceOrder",
    sortOrder: "asc",
  },
};

const installmentCategorySlice = createSlice({
  name: "installmentCategories",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<InstallmentCategoryState["filters"]>>,
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

export const { setFilters, resetFilters } = installmentCategorySlice.actions;
export default installmentCategorySlice.reducer;
