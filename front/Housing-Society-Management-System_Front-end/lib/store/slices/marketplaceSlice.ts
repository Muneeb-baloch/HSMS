// lib/store/slices/marketplaceSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MarketplaceFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
}

interface MarketplaceState {
  filters: MarketplaceFilters;
}

const initialState: MarketplaceState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<MarketplaceFilters>>,
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

export const { setFilters, resetFilters } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
