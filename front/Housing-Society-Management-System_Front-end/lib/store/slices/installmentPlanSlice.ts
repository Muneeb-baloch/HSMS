// src/lib/store/slices/installmentPlanSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InstallmentPlanState {
  filters: {
    page: number;
    limit: number;
    search?: string;
    projectId?: string;
    isActive?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: InstallmentPlanState = {
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

const installmentPlanSlice = createSlice({
  name: 'installmentPlans',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<InstallmentPlanState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      Object.keys(state.filters).forEach(key => {
        if ((state.filters as Record<string, unknown>)[key] === undefined) {
          delete (state.filters as Record<string, unknown>)[key];
        }
      });
    },
    resetFilters: state => {
      state.filters = { ...initialState.filters };
    },
  },
});

export const { setFilters, resetFilters } = installmentPlanSlice.actions;
export default installmentPlanSlice.reducer;
