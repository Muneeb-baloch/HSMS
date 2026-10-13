import { AnnouncementQueryParams } from "@/lib/types/announcement";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AnnouncementState {
  filters: AnnouncementQueryParams;
}

const initialState: AnnouncementState = {
  filters: {
    page: 1,
    limit: 15,
    sortBy: "publishedAt",
    sortOrder: "desc",
  },
};

export const announcementSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<AnnouncementQueryParams>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
  },
});

export const { setFilters, resetFilters } = announcementSlice.actions;
export default announcementSlice.reducer;
