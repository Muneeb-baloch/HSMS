import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PrivacyFilters {
  page: number;
  limit: number;
}

interface PrivacyState {
  filters: PrivacyFilters;
}

const initialState: PrivacyState = {
  filters: {
    page: 1,
    limit: 20,
  },
};

const privacySlice = createSlice({
  name: "privacy",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PrivacyFilters>>) => {
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

export const { setFilters, resetFilters } = privacySlice.actions;
export default privacySlice.reducer;
