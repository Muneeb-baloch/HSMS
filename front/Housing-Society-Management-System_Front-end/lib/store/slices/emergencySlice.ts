// lib/store/slices/emergencySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EmergencyFilters {
  page: number;
  limit: number;
  search: string;
  type?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}

interface EmergencyState {
  filters: EmergencyFilters;
}

const initialState: EmergencyState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const emergencySlice = createSlice({
  name: "emergency",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<EmergencyFilters>>) => {
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

export const { setFilters, resetFilters } = emergencySlice.actions;
export default emergencySlice.reducer;
