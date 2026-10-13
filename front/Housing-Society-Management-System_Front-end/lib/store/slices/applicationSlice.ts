// src/lib/store/slices/applicationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApplicationState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    applicationNo?: string;
    applicationTypeID?: string;
    memId?: string;
    plotId?: string;
    statusId?: string;
    startDate?: string;
    endDate?: string;
  };
}

const initialState: ApplicationState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "applicationDate",
    sortOrder: "desc",
  },
};

const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<ApplicationState["filters"]>>,
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

export const { setFilters, resetFilters } = applicationSlice.actions;
export default applicationSlice.reducer;
