// src/lib/API/plotApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  CreatePlotDto,
  Plot,
  PlotAssignmentDto,
  PlotFilterOptions,
  PlotPriceCalculationDto,
  PlotQueryParams,
  PlotStatistics,
  UpdatePlotDto,
} from "../types/plot";

export const plotApi = createApi({
  reducerPath: "plotApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Plot", "PlotStatistics", "AvailablePlots"],
  endpoints: (builder) => ({
    // Get all plots with pagination
    getPlots: builder.query<
      PaginatedResponse<Plot> & { summary?: any },
      PlotQueryParams
    >({
      query: (params) => ({
        url: "/plots",
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          projectId: params.projectId,
          plotBlockId: params.plotBlockId,
          plotType: params.plotType?.join(","),
          salesStatusId: params.salesStatusId?.join(","),
          srDevStatId: params.srDevStatId?.join(","),
          plotCategoryId: params.plotCategoryId?.join(","),
          isAvailable: params.isAvailable,
          isPossessionReady: params.isPossessionReady,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          minArea: params.minArea,
          maxArea: params.maxArea,
          hasFile: params.hasFile,
        },
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        items: response.data.plots,
        pagination: response.data.pagination,
        summary: response.data.summary,
      }),
      providesTags: ["Plot"],
    }),

    // Get single plot
    getPlot: builder.query<Plot, string>({
      query: (id) => `/plots/${id}`,
      transformResponse: (response: ApiResponse<Plot>) => response.data,
      providesTags: (result, error, id) => [{ type: "Plot", id }],
    }),

    // Create plot
    createPlot: builder.mutation<Plot, CreatePlotDto>({
      query: (data) => ({
        url: "/plots",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Plot>) => response.data,
      invalidatesTags: ["Plot", "PlotStatistics", "AvailablePlots"],
    }),

    // Update plot
    updatePlot: builder.mutation<Plot, { id: string; data: UpdatePlotDto }>({
      query: ({ id, data }) => ({
        url: `/plots/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Plot>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        "Plot",
        "PlotStatistics",
        "AvailablePlots",
        { type: "Plot", id },
      ],
    }),

    // Delete plot
    deletePlot: builder.mutation<void, string>({
      query: (id) => ({
        url: `/plots/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Plot", "PlotStatistics", "AvailablePlots"],
    }),

    // Assign plot to customer
    assignPlot: builder.mutation<Plot, PlotAssignmentDto>({
      query: (data) => ({
        url: "/plots/assign",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Plot>) => response.data,
      invalidatesTags: ["Plot", "PlotStatistics", "AvailablePlots"],
    }),

    // Unassign plot
    unassignPlot: builder.mutation<Plot, string>({
      query: (id) => ({
        url: `/plots/${id}/unassign`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Plot>) => response.data,
      invalidatesTags: ["Plot", "PlotStatistics", "AvailablePlots"],
    }),

    // Mark possession ready
    markPossessionReady: builder.mutation<Plot, string>({
      query: (id) => ({
        url: `/plots/${id}/possession-ready`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Plot>) => response.data,
      invalidatesTags: ["Plot", "PlotStatistics"],
    }),

    // Get plot statistics
    getPlotStatistics: builder.query<PlotStatistics, string | undefined>({
      query: (projectId) => ({
        url: "/plots/stats/summary",
        params: projectId ? { projectId } : undefined,
      }),
      transformResponse: (response: ApiResponse<PlotStatistics>) =>
        response.data,
      providesTags: ["PlotStatistics"],
    }),

    // Get available plots
    getAvailablePlots: builder.query<
      Plot[],
      { projectId?: string; blockId?: string }
    >({
      query: ({ projectId, blockId }) => ({
        url: "/plots/available",
        params: {
          projectId,
          blockId,
        },
      }),
      transformResponse: (response: ApiResponse<Plot[]>) => response.data,
      providesTags: ["AvailablePlots"],
    }),

    // Calculate plot price
    calculatePlotPrice: builder.mutation<any, PlotPriceCalculationDto>({
      query: (data) => ({
        url: "/plots/calculate-price",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

    // Bulk update plots
    bulkUpdatePlots: builder.mutation<
      { matched: number; modified: number; errors: string[] },
      { plotIds: string[]; field: string; value: any }
    >({
      query: (data) => ({
        url: "/plots/bulk-update",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      invalidatesTags: ["Plot", "PlotStatistics"],
    }),

    // Get plot types
    getPlotTypes: builder.query<Array<{ value: string; label: string }>, void>({
      query: () => "/plots/types",
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

    // Search plots with filters
    searchPlotsWithFilters: builder.query<Plot[], PlotFilterOptions>({
      query: (filters) => ({
        url: "/plots/search/filter",
        params: {
          projectId: filters.projectId,
          blockId: filters.blockId,
          type: filters.type?.join(","),
          category: filters.category?.join(","),
          status: filters.status?.join(","),
          minArea: filters.minArea,
          maxArea: filters.maxArea,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          availability: filters.availability,
        },
      }),
      transformResponse: (response: ApiResponse<Plot[]>) => response.data,
    }),

    // Get plot by registration number
    getPlotByRegistrationNo: builder.query<Plot, string>({
      query: (registrationNo) => `/plots/registration/${registrationNo}`,
      transformResponse: (response: ApiResponse<Plot>) => response.data,
    }),

    // Get plots by project
    getPlotsByProject: builder.query<Plot[], string>({
      query: (projectId) => `/plots/project/${projectId}`,
      transformResponse: (response: ApiResponse<Plot[]>) => response.data,
    }),

    // Get plots by block
    getPlotsByBlock: builder.query<Plot[], string>({
      query: (blockId) => `/plots/block/${blockId}`,
      transformResponse: (response: ApiResponse<Plot[]>) => response.data,
    }),

    // Get plots by file
    getPlotsByFile: builder.query<Plot[], string>({
      query: (fileId) => `/plots/file/${fileId}`,
      transformResponse: (response: ApiResponse<Plot[]>) => response.data,
    }),

    // Get plot next actions
    getPlotNextActions: builder.query<any, string>({
      query: (id) => `/plots/${id}/next-actions`,
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

    // Validate plot assignment
    validatePlotAssignment: builder.query<any, string>({
      query: (id) => `/plots/${id}/validate-assignment`,
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

    // Get plot map data
    getPlotMapData: builder.query<any[], string>({
      query: (projectId) => `/plots/map/${projectId}`,
      transformResponse: (response: ApiResponse<any[]>) => response.data,
    }),

    // Generate inventory report
    generatePlotInventoryReport: builder.query<any, string>({
      query: (projectId) => `/plots/report/inventory/${projectId}`,
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),
  }),
});

export const {
  useGetPlotsQuery,
  useGetPlotQuery,
  useCreatePlotMutation,
  useUpdatePlotMutation,
  useDeletePlotMutation,
  useAssignPlotMutation,
  useUnassignPlotMutation,
  useMarkPossessionReadyMutation,
  useGetPlotStatisticsQuery,
  useGetAvailablePlotsQuery,
  useCalculatePlotPriceMutation,
  useBulkUpdatePlotsMutation,
  useGetPlotTypesQuery,
  useSearchPlotsWithFiltersQuery,
  useGetPlotByRegistrationNoQuery,
  useGetPlotsByProjectQuery,
  useGetPlotsByBlockQuery,
  useGetPlotsByFileQuery,
  useGetPlotNextActionsQuery,
  useValidatePlotAssignmentQuery,
  useGetPlotMapDataQuery,
  useGeneratePlotInventoryReportQuery,
} = plotApi;
