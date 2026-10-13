// src/lib/store/slices/salesStatusSlice.ts
import { salesStatusApi } from "@/lib/API/salesStatusApi";
import { SalesStatusType } from "@/lib/types/salesStatus";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SalesStatusFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  statusType?: SalesStatusType[];
  isActive?: boolean;
  allowsSale?: boolean;
  requiresApproval?: boolean;
}

interface SalesStatusState {
  filters: SalesStatusFilters;
  selectedStatus: any | null;
  bulkSelection: string[];
  isLoading: boolean;
}

const initialState: SalesStatusState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "sequence",
    sortOrder: "asc",
  },
  selectedStatus: null,
  bulkSelection: [],
  isLoading: false,
};

const salesStatusSlice = createSlice({
  name: "salesStatus",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SalesStatusFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedStatus: (state, action: PayloadAction<any | null>) => {
      state.selectedStatus = action.payload;
    },
    setBulkSelection: (state, action: PayloadAction<string[]>) => {
      state.bulkSelection = action.payload;
    },
    addToBulkSelection: (state, action: PayloadAction<string>) => {
      if (!state.bulkSelection.includes(action.payload)) {
        state.bulkSelection.push(action.payload);
      }
    },
    removeFromBulkSelection: (state, action: PayloadAction<string>) => {
      state.bulkSelection = state.bulkSelection.filter(
        (id) => id !== action.payload,
      );
    },
    clearBulkSelection: (state) => {
      state.bulkSelection = [];
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      salesStatusApi.endpoints.getSalesStatuses.matchPending,
      (state) => {
        state.isLoading = true;
      },
    );
    builder.addMatcher(
      salesStatusApi.endpoints.getSalesStatuses.matchFulfilled,
      (state) => {
        state.isLoading = false;
      },
    );
    builder.addMatcher(
      salesStatusApi.endpoints.getSalesStatuses.matchRejected,
      (state) => {
        state.isLoading = false;
      },
    );
  },
});

export const {
  setFilters,
  resetFilters,
  setSelectedStatus,
  setBulkSelection,
  addToBulkSelection,
  removeFromBulkSelection,
  clearBulkSelection,
  setIsLoading,
} = salesStatusSlice.actions;

export default salesStatusSlice.reducer;
