import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  Possession,
  CreatePossessionDto,
  UpdatePossessionDto,
  PossessionQueryParams,
  StatusTransitionDto,
  CollectorUpdateDto,
  PossessionStatus,
} from "../types/possession";

export const possessionsApi = createApi({
  reducerPath: "possessionsApi",
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
  tagTypes: ["Possession", "PossessionStatistics"],
  endpoints: (builder) => ({
    // Get all possessions with pagination and filters
    getPossessions: builder.query<
      PaginatedResponse<Possession> & { summary: any },
      PossessionQueryParams
    >({
      query: (params) => ({
        url: "/possession",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          sortBy: params.sortBy || "createdAt",
          sortOrder: params.sortOrder || "desc",
          fileId: params.fileId,
          plotId: params.plotId,
          status: params.status?.join(","),
          isCollected: params.isCollected,
          csrId: params.csrId,
          startDate: params.startDate?.toISOString(),
          endDate: params.endDate?.toISOString(),
          minDuration: params.minDuration,
          maxDuration: params.maxDuration,
          projectId: params.projectId,
        },
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        items: response.data.possessions,
        pagination: response.data.pagination,
        summary: response.data.summary,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ _id }) => ({
                type: "Possession" as const,
                id: _id,
              })),
              { type: "Possession", id: "LIST" },
            ]
          : [{ type: "Possession", id: "LIST" }],
    }),

    // Get single possession by ID
    getPossession: builder.query<Possession, string>({
      query: (id) => `/possession/${id}`,
      transformResponse: (response: ApiResponse<Possession>) => response.data,
      providesTags: (result, error, id) => [{ type: "Possession", id }],
    }),

    // Get possession by code
    getPossessionByCode: builder.query<Possession, string>({
      query: (code) => `/possession/code/${code}`,
      transformResponse: (response: ApiResponse<Possession>) => response.data,
    }),

    // Create new possession
    createPossession: builder.mutation<Possession, CreatePossessionDto>({
      query: (data) => ({
        url: "/possession",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Possession>) => response.data,
      invalidatesTags: [{ type: "Possession", id: "LIST" }],
    }),

    // Update possession
    updatePossession: builder.mutation<
      Possession,
      { id: string; data: UpdatePossessionDto }
    >({
      query: ({ id, data }) => ({
        url: `/possession/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Possession>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Possession", id },
        { type: "Possession", id: "LIST" },
      ],
    }),

    // Delete possession (soft delete)
    deletePossession: builder.mutation<void, string>({
      query: (id) => ({
        url: `/possession/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Possession", id: "LIST" }],
    }),

    // Update possession status
    updateStatus: builder.mutation<
      Possession,
      { id: string; data: StatusTransitionDto }
    >({
      query: ({ id, data }) => ({
        url: `/possession/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Possession>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Possession", id },
        { type: "Possession", id: "LIST" },
      ],
    }),

    // Update collector information
    updateCollector: builder.mutation<
      Possession,
      { id: string; data: CollectorUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `/possession/${id}/collector`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Possession>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Possession", id },
        { type: "Possession", id: "LIST" },
      ],
    }),

    // Get possessions by file ID
    getPossessionsByFile: builder.query<Possession[], string>({
      query: (fileId) => `/possession/file/${fileId}`,
      transformResponse: (response: ApiResponse<Possession[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Possession" as const,
                id: _id,
              })),
              { type: "Possession", id: "LIST" },
            ]
          : [{ type: "Possession", id: "LIST" }],
    }),

    // Get possessions by plot ID
    getPossessionsByPlot: builder.query<Possession[], string>({
      query: (plotId) => `/possession/plot/${plotId}`,
      transformResponse: (response: ApiResponse<Possession[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Possession" as const,
                id: _id,
              })),
              { type: "Possession", id: "LIST" },
            ]
          : [{ type: "Possession", id: "LIST" }],
    }),

    // Get possessions by status
    getPossessionsByStatus: builder.query<Possession[], PossessionStatus>({
      query: (status) => `/possession/status/${status}`,
      transformResponse: (response: ApiResponse<Possession[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Possession" as const,
                id: _id,
              })),
              { type: "Possession", id: "LIST" },
            ]
          : [{ type: "Possession", id: "LIST" }],
    }),

    // Get pending possessions
    getPendingPossessions: builder.query<Possession[], void>({
      query: () => "/possession/pending",
      transformResponse: (response: ApiResponse<Possession[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Possession" as const,
                id: _id,
              })),
              { type: "Possession", id: "LIST" },
            ]
          : [{ type: "Possession", id: "LIST" }],
    }),

    // Get possessions by CSR
    getPossessionsByCSR: builder.query<Possession[], string>({
      query: (csrId) => `/possession/csr/${csrId}`,
      transformResponse: (response: ApiResponse<Possession[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Possession" as const,
                id: _id,
              })),
              { type: "Possession", id: "LIST" },
            ]
          : [{ type: "Possession", id: "LIST" }],
    }),

    // Get possession statistics
    getStatistics: builder.query<any, { startDate?: Date; endDate?: Date }>({
      query: ({ startDate, endDate } = {}) => ({
        url: "/possession/stats/summary",
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      providesTags: [{ type: "PossessionStatistics", id: "STATS" }],
    }),

    // Generate report
    generateReport: builder.mutation<
      any,
      {
        startDate: Date;
        endDate: Date;
        status?: PossessionStatus;
        csrId?: string;
        projectId?: string;
      }
    >({
      query: (data) => ({
        url: "/possession/report/generate",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

    // Bulk update status
    bulkUpdateStatus: builder.mutation<
      { matched: number; modified: number; errors: string[] },
      {
        possessionIds: string[];
        status: PossessionStatus;
        remarks?: string;
      }
    >({
      query: (data) => ({
        url: "/possession/bulk/status",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Possession", id: "LIST" }],
    }),

    // Get overdue possessions
    getOverduePossessions: builder.query<Possession[], { days?: number }>({
      query: ({ days } = {}) => ({
        url: "/possession/overdue",
        params: { days },
      }),
      transformResponse: (response: ApiResponse<Possession[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Possession" as const,
                id: _id,
              })),
              { type: "Possession", id: "LIST" },
            ]
          : [{ type: "Possession", id: "LIST" }],
    }),

    // Validate handover
    validateHandover: builder.query<
      { isValid: boolean; message?: string; missingFields?: string[] },
      string
    >({
      query: (id) => `/possession/${id}/validate-handover`,
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

    // Get possession timeline
    getTimeline: builder.query<any[], string>({
      query: (id) => `/possession/${id}/timeline`,
      transformResponse: (response: ApiResponse<any[]>) => response.data,
    }),

    // Get allowed next statuses
    getAllowedNextStatuses: builder.query<
      {
        currentStatus: PossessionStatus;
        allowedNextStatuses: PossessionStatus[];
      },
      string
    >({
      query: (id) => `/possession/${id}/allowed-statuses`,
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

    // Check letter collected status
    checkLetterCollected: builder.query<
      {
        isCollected: boolean;
        collectorName?: string;
        collectorNic?: string;
        collectionDate?: Date;
      },
      string
    >({
      query: (id) => `/possession/${id}/check-letter`,
      transformResponse: (response: ApiResponse<any>) => response.data,
    }),

    // Update survey information
    updateSurveyInfo: builder.mutation<
      Possession,
      {
        id: string;
        data: {
          surveyPerson: string;
          surveyDate?: Date;
          surveyRemarks?: string;
          coordinates?: { latitude: number; longitude: number };
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/possession/${id}/survey`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Possession>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Possession", id },
        { type: "Possession", id: "LIST" },
      ],
    }),

    // Search possessions near location
    searchNearLocation: builder.query<
      Possession[],
      { latitude: number; longitude: number; maxDistance?: number }
    >({
      query: ({ latitude, longitude, maxDistance = 5000 }) => ({
        url: "/possession/search/location",
        params: { latitude, longitude, maxDistance },
      }),
      transformResponse: (response: ApiResponse<Possession[]>) => response.data,
    }),

    // Generate handover certificate
    generateCertificate: builder.mutation<
      any,
      {
        possessionId: string;
        certificateNumber: string;
        certificateDate: Date;
        issuedBy: string;
        authorizedSignatory: string;
        certificatePath: string;
      }
    >({
      query: (data) => ({
        url: "/possession/certificate/generate",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      invalidatesTags: (result, error, { possessionId }) => [
        { type: "Possession", id: possessionId },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetPossessionsQuery,
  useGetPossessionQuery,
  useGetPossessionByCodeQuery,
  useCreatePossessionMutation,
  useUpdatePossessionMutation,
  useDeletePossessionMutation,
  useUpdateStatusMutation,
  useUpdateCollectorMutation,
  useGetPossessionsByFileQuery,
  useGetPossessionsByPlotQuery,
  useGetPossessionsByStatusQuery,
  useGetPendingPossessionsQuery,
  useGetPossessionsByCSRQuery,
  useGetStatisticsQuery,
  useGenerateReportMutation,
  useBulkUpdateStatusMutation,
  useGetOverduePossessionsQuery,
  useValidateHandoverQuery,
  useGetTimelineQuery,
  useGetAllowedNextStatusesQuery,
  useCheckLetterCollectedQuery,
  useUpdateSurveyInfoMutation,
  useSearchNearLocationQuery,
  useGenerateCertificateMutation,
} = possessionsApi;
