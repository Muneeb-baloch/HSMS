// src/lib/store/slices/fileSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FileState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    fileRegNo?: string;
    fileBarCode?: string;
    projId?: string;
    planId?: string;
    memId?: string;
    nomineeId?: string;
    plotId?: string;
    status?: string;
    isAdjusted?: boolean;
    isActive?: boolean;
    minAmount?: number;
    maxAmount?: number;
    fromDate?: string;
    toDate?: string;
  };
}

const initialState: FileState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "bookingDate",
    sortOrder: "desc",
  },
};

const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<FileState["filters"]>>,
    ) => {
      // Merge filters
      state.filters = { ...state.filters, ...action.payload };

      // Remove undefined values
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

export const { setFilters, resetFilters } = fileSlice.actions;
export default fileSlice.reducer;
