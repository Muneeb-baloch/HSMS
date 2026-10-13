// lib/store/slices/facilitySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FacilityQueryParams } from "@/lib/types/facility";

interface FacilityState {
  filters: FacilityQueryParams;
}

const initialState: FacilityState = {
  filters: {
    page: 1,
    limit: 10,
  },
};

const facilitySlice = createSlice({
  name: "facilities",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<FacilityQueryParams>>,
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

export const { setFilters, resetFilters } = facilitySlice.actions;
export default facilitySlice.reducer;
