// src/lib/store/slices/announcementCategorySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnnouncementCategoryState {
  filters: {
    page: number;
    limit: number;
    search: string;
    isActive?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: AnnouncementCategoryState = {
  filters: {
    page: 1,
    limit: 20,
    search: '',
    sortBy: 'priority',
    sortOrder: 'desc',
  },
};

const announcementCategorySlice = createSlice({
  name: 'announcementCategories',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AnnouncementCategoryState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      Object.keys(state.filters).forEach(key => {
        if ((state.filters as any)[key] === undefined) delete (state.filters as any)[key];
      });
    },
    resetFilters: state => {
      state.filters = { ...initialState.filters };
    },
  },
});

export const { setFilters, resetFilters } = announcementCategorySlice.actions;
export default announcementCategorySlice.reducer;
