import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AiFilters {
  page: number;
  limit: number;
  agentType?: string;
  status?: string;
  insightType?: string;
  category?: string;
  severity?: string;
}

interface AiState {
  filters: AiFilters;
}

const initialState: AiState = {
  filters: {
    page: 1,
    limit: 20,
  },
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AiFilters>>) => {
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

export const { setFilters, resetFilters } = aiSlice.actions;
export default aiSlice.reducer;
