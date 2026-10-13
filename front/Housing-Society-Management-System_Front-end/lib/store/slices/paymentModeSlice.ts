// src/lib/store/slices/paymentModeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PaymentModeState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    isActive?: boolean;
  };
}

const initialState: PaymentModeState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const paymentModeSlice = createSlice({
  name: "paymentModes",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<PaymentModeState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, resetFilters } = paymentModeSlice.actions;
export default paymentModeSlice.reducer;
