import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BillInfoQueryParams } from "@/lib/types/billInfo";

interface BillInfoState {
  filters: BillInfoQueryParams & {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const initialState: BillInfoState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "dueDate",
    sortOrder: "desc",
  },
};

const billInfoSlice = createSlice({
  name: "bills",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<BillInfoState["filters"]>>
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

export const { setFilters, resetFilters } = billInfoSlice.actions;
export default billInfoSlice.reducer;
