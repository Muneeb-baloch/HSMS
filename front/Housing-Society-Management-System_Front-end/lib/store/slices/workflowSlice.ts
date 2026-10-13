import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WorkflowFilters {
  page: number;
  limit: number;
  search: string;
  societyId?: string;
  triggerEntity?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface WorkflowState {
  filters: WorkflowFilters;
}

const initialState: WorkflowState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<WorkflowFilters>>) => {
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

export const { setFilters, resetFilters } = workflowSlice.actions;
export default workflowSlice.reducer;
