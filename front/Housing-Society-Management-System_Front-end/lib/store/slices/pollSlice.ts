// lib/store/slices/pollSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PollFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  type?: string;
}

interface PollState {
  filters: PollFilters;
}

const initialState: PollState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const pollSlice = createSlice({
  name: "polls",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PollFilters>>) => {
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

export const { setFilters, resetFilters } = pollSlice.actions;
export default pollSlice.reducer;
