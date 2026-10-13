import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InstallmentPlanDetailState {
  filters: {
    page: number;
    limit: number;
    search?: string;
    planId?: string;
    instCatId?: string;
    occurrence?: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: InstallmentPlanDetailState = {
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'occurrence',
    sortOrder: 'asc',
  },
};

const installmentPlanDetailSlice = createSlice({
  name: 'installmentPlanDetails',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<InstallmentPlanDetailState['filters']>>
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

export const { setFilters, resetFilters } = installmentPlanDetailSlice.actions;
export default installmentPlanDetailSlice.reducer;
