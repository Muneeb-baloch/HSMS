// lib/store/slices/meetingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MeetingFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

interface MeetingState {
  filters: MeetingFilters;
}

const initialState: MeetingState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const meetingSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<MeetingFilters>>) => {
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

export const { setFilters, resetFilters } = meetingSlice.actions;
export default meetingSlice.reducer;
