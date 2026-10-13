// src/lib/store/slices/nomineeSlice.ts
import { RelationType } from "@/lib/types/nominee";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NomineeState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    memId?: string;
    relationWithMember?: RelationType;
    isActive?: boolean;
  };
}

const initialState: NomineeState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const nomineeSlice = createSlice({
  name: "nominees",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<NomineeState["filters"]>>,
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

export const { setFilters, resetFilters } = nomineeSlice.actions;
export default nomineeSlice.reducer;
