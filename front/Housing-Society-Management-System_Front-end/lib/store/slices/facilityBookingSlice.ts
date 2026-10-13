// lib/store/slices/facilityBookingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookingQueryParams } from "@/lib/types/facility";

interface FacilityBookingState {
  filters: BookingQueryParams;
}

const initialState: FacilityBookingState = {
  filters: {
    page: 1,
    limit: 10,
  },
};

const facilityBookingSlice = createSlice({
  name: "facilityBookings",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<BookingQueryParams>>,
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

export const { setFilters, resetFilters } = facilityBookingSlice.actions;
export default facilityBookingSlice.reducer;
