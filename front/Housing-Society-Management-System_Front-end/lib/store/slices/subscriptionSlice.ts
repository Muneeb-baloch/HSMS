// lib/store/slices/subscriptionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PackageQueryParams } from "@/lib/types/subscription";

interface SubscriptionState {
  filters: PackageQueryParams;
}

const initialState: SubscriptionState = {
  filters: {
    page: 1,
    limit: 10,
  },
};

const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<PackageQueryParams>>,
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

export const { setFilters, resetFilters } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
