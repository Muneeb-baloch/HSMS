import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VendorFilters {
  page: number;
  limit: number;
  search: string;
  vendorType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  workOrderStatus?: string;
  contractStatus?: string;
  invoiceStatus?: string;
}

interface VendorState {
  filters: VendorFilters;
}

const initialState: VendorState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<VendorFilters>>) => {
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

export const { setFilters, resetFilters } = vendorSlice.actions;
export default vendorSlice.reducer;
