// src/lib/store/slices/projectSlice.ts
import { ProjectStatus, ProjectType } from "@/lib/types/project";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProjectState {
  filters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    status?: ProjectStatus[];
    type?: ProjectType[];
    isActive?: boolean;
    cityId?: string;
    country?: string;
    minPlots?: number;
    maxPlots?: number;
    minArea?: number;
    maxArea?: number;
    launchedAfter?: string;
    launchedBefore?: string;
  };
}

const initialState: ProjectState = {
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<ProjectState["filters"]>>,
    ) => {
      // Merge filters properly - undefined values should remove fields
      state.filters = { ...state.filters, ...action.payload };

      // Remove undefined values to prevent sending them as query params
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

export const { setFilters, resetFilters } = projectSlice.actions;
export default projectSlice.reducer;
