import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GamificationFilters {
  page: number;
  limit: number;
  societyId?: string;
  period?: "monthly" | "yearly" | "all-time";
}

interface GamificationState {
  filters: GamificationFilters;
}

const initialState: GamificationState = {
  filters: {
    page: 1,
    limit: 20,
  },
};

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<GamificationFilters>>) => {
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

export const { setFilters, resetFilters } = gamificationSlice.actions;
export default gamificationSlice.reducer;
