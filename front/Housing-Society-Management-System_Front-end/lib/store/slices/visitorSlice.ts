// lib/store/slices/visitorSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VisitorQueryParams } from "@/lib/types/visitor";

interface VisitorState {
  filters: VisitorQueryParams;
}

const initialState: VisitorState = {
  filters: {
    page: 1,
    limit: 20,
  },
};

const visitorSlice = createSlice({
  name: "visitors",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<VisitorQueryParams>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };

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

export const { setFilters, resetFilters } = visitorSlice.actions;
export default visitorSlice.reducer;
