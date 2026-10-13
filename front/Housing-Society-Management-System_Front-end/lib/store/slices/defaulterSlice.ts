import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DefaulterQueryParams } from "@/lib/types/defaulter";

interface DefaulterState {
  filters: DefaulterQueryParams & {
    page: number;
    limit: number;
    search?: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const initialState: DefaulterState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "daysOverdue",
    sortOrder: "desc",
  },
};

const defaulterSlice = createSlice({
  name: "defaulters",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<DefaulterState["filters"]>>
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

export const { setFilters, resetFilters } = defaulterSlice.actions;
export default defaulterSlice.reducer;
