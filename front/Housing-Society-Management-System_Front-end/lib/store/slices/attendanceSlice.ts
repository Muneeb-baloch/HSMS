import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AttendanceFilters {
  page: number;
  limit: number;
  staffId?: string;
  societyId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

interface AttendanceState {
  filters: AttendanceFilters;
}

const initialState: AttendanceState = {
  filters: {
    page: 1,
    limit: 20,
  },
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AttendanceFilters>>) => {
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

export const { setFilters, resetFilters } = attendanceSlice.actions;
export default attendanceSlice.reducer;
