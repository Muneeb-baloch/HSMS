import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BillTypeQueryParams } from "@/lib/types/billType";

interface BillTypeState {
  filters: BillTypeQueryParams & {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const initialState: BillTypeState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "billTypeName",
    sortOrder: "asc",
  },
};

const billTypeSlice = createSlice({
  name: "billTypes",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<BillTypeState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      Object.keys(state.filters).forEach((key) => {
        if ((state.filters as Record<string, unknown>)[key] === undefined) {
          delete (state.filters as Record<string, unknown>)[key];
        }
      });
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
  },
});

export const { setFilters, resetFilters } = billTypeSlice.actions;
export default billTypeSlice.reducer;
