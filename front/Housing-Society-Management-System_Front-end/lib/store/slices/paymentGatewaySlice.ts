// lib/store/slices/paymentGatewaySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PaymentGatewayFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface PaymentGatewayState {
  filters: PaymentGatewayFilters;
}

const initialState: PaymentGatewayState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const paymentGatewaySlice = createSlice({
  name: "paymentGateway",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<PaymentGatewayFilters>>,
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

export const { setFilters, resetFilters } = paymentGatewaySlice.actions;
export default paymentGatewaySlice.reducer;
