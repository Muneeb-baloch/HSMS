// src/lib/store/slices/registrySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RegistryQueryParams } from "@/lib/types/registry";

interface RegistryState {
  filters: RegistryQueryParams & {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const initialState: RegistryState = {
  filters: {
    page: 1,
    limit: 20,
    search: "" as string,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const registrySlice = createSlice({
  name: "registries",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<RegistryState["filters"]>>
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

export const { setFilters, resetFilters } = registrySlice.actions;
export default registrySlice.reducer;
