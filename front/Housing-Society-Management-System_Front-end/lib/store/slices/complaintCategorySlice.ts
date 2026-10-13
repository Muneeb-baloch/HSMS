// src/lib/store/slices/complaintCategorySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ComplaintCategoryState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    isActive?: boolean;
    minPriority?: number;
    maxPriority?: number;
    maxSlaHours?: number;
  };
}

const initialState: ComplaintCategoryState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "priorityLevel",
    sortOrder: "asc",
  },
};

const complaintCategorySlice = createSlice({
  name: "complaintCategories",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<ComplaintCategoryState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = complaintCategorySlice.actions;
export default complaintCategorySlice.reducer;
