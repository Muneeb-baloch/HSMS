// src/store/slices/memberSlice.ts

import { Member, MemberQueryParams } from "@/lib/types/entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MemberState {
  items: Member[];
  selectedItem: Member | null;
  filters: MemberQueryParams;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: MemberState = {
  items: [],
  selectedItem: null,
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  total: 0,
  isLoading: false,
  error: null,
};

const memberSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.items = action.payload;
    },
    addMember: (state, action: PayloadAction<Member>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    updateMember: (state, action: PayloadAction<Member>) => {
      const index = state.items.findIndex(
        (m: Member) => m._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeMember: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((m: Member) => m._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
    setSelectedMember: (state, action: PayloadAction<Member | null>) => {
      state.selectedItem = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<MemberQueryParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMembers: (state) => {
      state.items = [];
      state.total = 0;
      state.selectedItem = null;
    },
  },
});

export const {
  setMembers,
  addMember,
  updateMember,
  removeMember,
  setSelectedMember,
  setFilters,
  resetFilters,
  setTotal,
  setLoading,
  setError,
  clearMembers,
} = memberSlice.actions;

export default memberSlice.reducer;
