// lib/store/slices/smsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SMSFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface SMSState {
  filters: SMSFilters;
}

const initialState: SMSState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const smsSlice = createSlice({
  name: "sms",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SMSFilters>>) => {
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

export const { setFilters, resetFilters } = smsSlice.actions;
export default smsSlice.reducer;
