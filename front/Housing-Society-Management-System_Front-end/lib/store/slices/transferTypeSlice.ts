// src/lib/store/slices/transferTypeSlice.ts
import { TransferTypeQueryParams } from "@/lib/types/transfer-type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TransferTypeState {
  filters: TransferTypeQueryParams;
  selectedIds: string[];
}

const initialState: TransferTypeState = {
  filters: {
    page: 1,
    limit: 20,
    sortBy: "typeName",
    sortOrder: "asc",
    isActive: true,
  },
  selectedIds: [],
};

const transferTypeSlice = createSlice({
  name: "transferTypes",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<TransferTypeQueryParams>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.selectedIds = [];
    },
    setSelectedIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    clearSelectedIds: (state) => {
      state.selectedIds = [];
    },
  },
});

export const { setFilters, resetFilters, setSelectedIds, clearSelectedIds } =
  transferTypeSlice.actions;
export default transferTypeSlice.reducer;
