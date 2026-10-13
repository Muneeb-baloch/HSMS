// lib/store/slices/societySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SocietyQueryParams } from "@/lib/types/society";

interface SocietyState {
  filters: SocietyQueryParams;
}

const initialState: SocietyState = {
  filters: {
    page: 1,
    limit: 10,
  },
};

const societySlice = createSlice({
  name: "societies",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<SocietyQueryParams>>,
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

export const { setFilters, resetFilters } = societySlice.actions;
export default societySlice.reducer;
