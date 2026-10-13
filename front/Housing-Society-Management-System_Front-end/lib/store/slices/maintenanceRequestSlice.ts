// lib/store/slices/maintenanceRequestSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MaintenanceRequestFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

interface MaintenanceRequestState {
  filters: MaintenanceRequestFilters;
}

const initialState: MaintenanceRequestState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const maintenanceRequestSlice = createSlice({
  name: "maintenanceRequests",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<MaintenanceRequestFilters>>,
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

export const { setFilters, resetFilters } = maintenanceRequestSlice.actions;
export default maintenanceRequestSlice.reducer;
