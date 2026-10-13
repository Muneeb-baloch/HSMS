// src/lib/API/srDevStatusApi.ts
import {
  BulkStatusUpdateDto,
  CreateSrDevStatusDto,
  DevCategory,
  DevPhase,
  ProgressReport,
  SrDevStatus,
  SrDevStatusQueryParams,
  StatusOrder,
  StatusTransitionDto,
  UpdateSrDevStatusDto,
} from "@/lib/types/srdevstatus";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const srDevStatusApi = createApi({
  reducerPath: "srDevStatusApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["SrDevStatus", "SrDevStatusStats"],
  endpoints: (builder) => ({
    // Get all development statuses
    getSrDevStatuses: builder.query({
      query: (params: SrDevStatusQueryParams) => ({
        url: "/sr-dev-status",
        params: {
          ...params,
          devCategory: params.devCategory?.join(","),
          devPhase: params.devPhase?.join(","),
        },
      }),
      providesTags: ["SrDevStatus"],
    }),

    // Get development status by ID
    getSrDevStatus: builder.query<SrDevStatus, string>({
      query: (id) => `/sr-dev-status/${id}`,
      providesTags: (result, error, id) => [{ type: "SrDevStatus", id }],
    }),

    // Get development status by code
    getSrDevStatusByCode: builder.query<SrDevStatus, string>({
      query: (code) => `/sr-dev-status/code/${code}`,
    }),

    // Get active development statuses
    getActiveSrDevStatuses: builder.query<SrDevStatus[], void>({
      query: () => "/sr-dev-status/active",
      providesTags: ["SrDevStatus"],
    }),

    // Get default development status
    getDefaultSrDevStatus: builder.query<SrDevStatus, void>({
      query: () => "/sr-dev-status/default",
    }),

    // Get statuses by category
    getStatusesByCategory: builder.query<SrDevStatus[], DevCategory>({
      query: (category) => `/sr-dev-status/category/${category}`,
    }),

    // Get statuses by phase
    getStatusesByPhase: builder.query<SrDevStatus[], DevPhase>({
      query: (phase) => `/sr-dev-status/phase/${phase}`,
    }),

    // Create development status
    createSrDevStatus: builder.mutation<SrDevStatus, CreateSrDevStatusDto>({
      query: (data) => ({
        url: "/sr-dev-status",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SrDevStatus", "SrDevStatusStats"],
    }),

    // Update development status
    updateSrDevStatus: builder.mutation<
      SrDevStatus,
      { id: string; data: UpdateSrDevStatusDto }
    >({
      query: ({ id, data }) => ({
        url: `/sr-dev-status/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "SrDevStatus",
        { type: "SrDevStatus", id },
        "SrDevStatusStats",
      ],
    }),

    // Delete development status
    deleteSrDevStatus: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sr-dev-status/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SrDevStatus", "SrDevStatusStats"],
    }),

    toggleStatusActive: builder.mutation<SrDevStatus, string>({
      query: (id) => ({
        url: `/sr-dev-status/${id}/toggle-active`,
        method: "PATCH",
      }),
      invalidatesTags: ["SrDevStatus", "SrDevStatusStats"],
    }),

    // Update sequence
    updateStatusSequence: builder.mutation<
      SrDevStatus,
      { id: string; sequence: number }
    >({
      query: ({ id, sequence }) => ({
        url: `/sr-dev-status/${id}/sequence`,
        method: "PATCH",
        body: { sequence },
      }),
      invalidatesTags: ["SrDevStatus"],
    }),

    // Reorder statuses
    reorderStatuses: builder.mutation<boolean, StatusOrder[]>({
      query: (statusOrders) => ({
        url: "/sr-dev-status/reorder",
        method: "POST",
        body: { statusOrders },
      }),
      invalidatesTags: ["SrDevStatus"],
    }),

    // Bulk update
    bulkUpdateStatuses: builder.mutation<
      { matched: number; modified: number },
      BulkStatusUpdateDto
    >({
      query: (data) => ({
        url: "/sr-dev-status/bulk-update",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SrDevStatus", "SrDevStatusStats"],
    }),

    // Get statistics
    getSrDevStatusStatistics: builder.query({
      query: () => "/sr-dev-status/stats/summary",
      providesTags: ["SrDevStatusStats"],
    }),

    // Get development workflow
    getDevelopmentWorkflow: builder.query({
      query: () => "/sr-dev-status/workflow",
    }),

    // Get next logical statuses
    getNextLogicalStatuses: builder.query<SrDevStatus[], string>({
      query: (id) => `/sr-dev-status/${id}/next-statuses`,
    }),

    // Validate transition
    validateStatusTransition: builder.mutation({
      query: (data: StatusTransitionDto) => ({
        url: "/sr-dev-status/validate-transition",
        method: "POST",
        body: data,
      }),
    }),

    // Calculate project progress
    calculateProjectProgress: builder.mutation<
      ProgressReport,
      { statusIds: string[] }
    >({
      query: (data) => ({
        url: "/sr-dev-status/calculate-progress",
        method: "POST",
        body: data,
      }),
    }),

    // Get development phases progress
    getDevelopmentPhasesProgress: builder.query({
      query: () => "/sr-dev-status/phases-progress",
    }),

    // Check requires documentation
    checkRequiresDocumentation: builder.query<boolean, string>({
      query: (id) => `/sr-dev-status/${id}/check-documentation`,
      transformResponse: (response: any) => response.data.requiresDocumentation,
    }),

    // Get estimated completion
    getEstimatedCompletion: builder.query({
      query: (id) => `/sr-dev-status/${id}/estimated-completion`,
    }),

    // Get development timeline
    getDevelopmentTimeline: builder.query({
      query: (projectId) => `/sr-dev-status/project/${projectId}/timeline`,
    }),
  }),
});

export const {
  useGetSrDevStatusesQuery,
  useGetSrDevStatusQuery,
  useGetSrDevStatusByCodeQuery,
  useGetActiveSrDevStatusesQuery,
  useGetDefaultSrDevStatusQuery,
  useGetStatusesByCategoryQuery,
  useGetStatusesByPhaseQuery,
  useCreateSrDevStatusMutation,
  useUpdateSrDevStatusMutation,
  useDeleteSrDevStatusMutation,
  useToggleStatusActiveMutation,
  useUpdateStatusSequenceMutation,
  useReorderStatusesMutation,
  useBulkUpdateStatusesMutation,
  useGetSrDevStatusStatisticsQuery,
  useGetDevelopmentWorkflowQuery,
  useGetNextLogicalStatusesQuery,
  useValidateStatusTransitionMutation,
  useCalculateProjectProgressMutation,
  useGetDevelopmentPhasesProgressQuery,
  useCheckRequiresDocumentationQuery,
  useGetEstimatedCompletionQuery,
  useGetDevelopmentTimelineQuery,
} = srDevStatusApi;
