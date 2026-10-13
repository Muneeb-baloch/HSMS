// src/lib/store/slices/srDevStatusSlice.ts
import { srDevStatusApi } from "@/lib/API/srDevStatusApi";
import { DevCategory, DevPhase } from "@/lib/types/srdevstatus";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SrDevStatusFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  devCategory?: DevCategory[];
  devPhase?: DevPhase[];
  isActive?: boolean;
  requiresDocumentation?: boolean;
  minPercentage?: number;
  maxPercentage?: number;
}

interface SrDevStatusState {
  filters: SrDevStatusFilters;
  selectedStatus: any | null;
  bulkSelection: string[];
  isLoading: boolean;
}

const initialState: SrDevStatusState = {
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

const srDevStatusSlice = createSlice({
  name: "srDevStatus",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SrDevStatusFilters>>) => {
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
      srDevStatusApi.endpoints.getSrDevStatuses.matchPending,
      (state) => {
        state.isLoading = true;
      },
    );
    builder.addMatcher(
      srDevStatusApi.endpoints.getSrDevStatuses.matchFulfilled,
      (state) => {
        state.isLoading = false;
      },
    );
    builder.addMatcher(
      srDevStatusApi.endpoints.getSrDevStatuses.matchRejected,
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
} = srDevStatusSlice.actions;

export default srDevStatusSlice.reducer;
