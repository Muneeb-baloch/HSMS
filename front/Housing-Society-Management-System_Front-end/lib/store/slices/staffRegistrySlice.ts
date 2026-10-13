// lib/store/slices/staffRegistrySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StaffRegistryFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  type?: string;
  verificationStatus?: string;
}

interface StaffRegistryState {
  filters: StaffRegistryFilters;
}

const initialState: StaffRegistryState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const staffRegistrySlice = createSlice({
  name: "staffRegistry",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<StaffRegistryFilters>>,
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

export const { setFilters, resetFilters } = staffRegistrySlice.actions;
export default staffRegistrySlice.reducer;
