import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlraFilters {
  page: number;
  limit: number;
  societyId?: string;
  certificateType?: string;
  status?: string;
  syncStatus?: string;
}

interface PlraState {
  filters: PlraFilters;
}

const initialState: PlraState = {
  filters: {
    page: 1,
    limit: 20,
  },
};

const plraSlice = createSlice({
  name: "plra",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PlraFilters>>) => {
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

export const { setFilters, resetFilters } = plraSlice.actions;
export default plraSlice.reducer;
