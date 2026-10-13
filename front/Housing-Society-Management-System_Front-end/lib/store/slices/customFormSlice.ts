import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CustomFormFilters {
  page: number;
  limit: number;
  search: string;
  entityType?: string;
  societyId?: string;
  fieldType?: string;
  isActive?: boolean;
}

interface CustomFormState {
  filters: CustomFormFilters;
}

const initialState: CustomFormState = {
  filters: {
    page: 1,
    limit: 20,
    search: "",
  },
};

const customFormSlice = createSlice({
  name: "customForms",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CustomFormFilters>>) => {
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

export const { setFilters, resetFilters } = customFormSlice.actions;
export default customFormSlice.reducer;
