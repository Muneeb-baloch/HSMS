// lib/store/slices/parkingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ParkingFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  type?: string;
  zone?: string;
}

interface ParkingState {
  filters: ParkingFilters;
}

const initialState: ParkingState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const parkingSlice = createSlice({
  name: "parking",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ParkingFilters>>) => {
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

export const { setFilters, resetFilters } = parkingSlice.actions;
export default parkingSlice.reducer;
