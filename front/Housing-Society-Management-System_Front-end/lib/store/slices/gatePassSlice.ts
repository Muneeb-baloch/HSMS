// lib/store/slices/gatePassSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GatePassFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

interface GatePassState {
  filters: GatePassFilters;
}

const initialState: GatePassState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const gatePassSlice = createSlice({
  name: "gatePasses",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<GatePassFilters>>) => {
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

export const { setFilters, resetFilters } = gatePassSlice.actions;
export default gatePassSlice.reducer;
