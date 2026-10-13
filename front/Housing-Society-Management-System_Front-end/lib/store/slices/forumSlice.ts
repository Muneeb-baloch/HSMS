// lib/store/slices/forumSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ForumFilters {
  page: number;
  limit: number;
  search: string;
  category?: string;
  status?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface ForumState {
  filters: ForumFilters;
}

const initialState: ForumState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ForumFilters>>) => {
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

export const { setFilters, resetFilters } = forumSlice.actions;
export default forumSlice.reducer;
