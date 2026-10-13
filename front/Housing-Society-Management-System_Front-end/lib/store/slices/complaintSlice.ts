// src/lib/store/slices/complaintSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ComplaintQueryParams } from "@/lib/types/complaint";

interface ComplaintState {
  filters: ComplaintQueryParams & {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const initialState: ComplaintState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "compDate",
    sortOrder: "desc",
  },
};

const complaintSlice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<ComplaintState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      Object.keys(state.filters).forEach((key) => {
        if ((state.filters as Record<string, unknown>)[key] === undefined) {
          delete (state.filters as Record<string, unknown>)[key];
        }
      });
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
  },
});

export const { setFilters, resetFilters } = complaintSlice.actions;
export default complaintSlice.reducer;
