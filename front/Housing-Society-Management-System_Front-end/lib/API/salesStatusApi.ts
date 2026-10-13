// src/lib/API/salesStatusApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiClient } from "../API/client";
import {
  BulkStatusUpdateDto,
  CreateSalesStatusDto,
  SalesStatus,
  SalesStatusQueryParams,
  StatusOrder,
  UpdateSalesStatusDto,
  WorkflowValidationDto,
} from "@/lib/types/salesStatus";

export const salesStatusApi = createApi({
  reducerPath: "salesStatusApi",
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
  tagTypes: ["SalesStatus", "SalesStatusStats"],
  endpoints: (builder) => ({
    // Get all sales statuses
    getSalesStatuses: builder.query({
      query: (params: SalesStatusQueryParams) => ({
        url: "/sales-status",
        params: {
          ...params,
          statusType: params.statusType?.join(","),
        },
      }),
      providesTags: ["SalesStatus"],
    }),

    // Get sales status by ID
    getSalesStatus: builder.query<SalesStatus, string>({
      query: (id) => `/sales-status/${id}`,
      providesTags: (result, error, id) => [{ type: "SalesStatus", id }],
    }),

    // Get sales status by code
    getSalesStatusByCode: builder.query<SalesStatus, string>({
      query: (code) => `/sales-status/code/${code}`,
    }),

    // Get active sales statuses
    getActiveSalesStatuses: builder.query<SalesStatus[], void>({
      query: () => "/sales-status/active",
      providesTags: ["SalesStatus"],
    }),

    // Get default sales status
    getDefaultSalesStatus: builder.query<SalesStatus, void>({
      query: () => "/sales-status/default",
    }),

    // Get sales allowed statuses
    getSalesAllowedStatuses: builder.query<SalesStatus[], void>({
      query: () => "/sales-status/sales-allowed",
    }),

    // Get statuses by type
    getStatusesByType: builder.query<SalesStatus[], string>({
      query: (type) => `/sales-status/type/${type}`,
    }),

    // Create sales status
    createSalesStatus: builder.mutation<SalesStatus, CreateSalesStatusDto>({
      query: (data) => ({
        url: "/sales-status",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SalesStatus", "SalesStatusStats"],
    }),

    // Update sales status
    updateSalesStatus: builder.mutation<
      SalesStatus,
      { id: string; data: UpdateSalesStatusDto }
    >({
      query: ({ id, data }) => ({
        url: `/sales-status/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "SalesStatus",
        { type: "SalesStatus", id },
        "SalesStatusStats",
      ],
    }),

    // Delete sales status
    deleteSalesStatus: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sales-status/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesStatus", "SalesStatusStats"],
    }),

    // Toggle active status
    toggleStatusActive: builder.mutation<SalesStatus, string>({
      query: (id) => ({
        url: `/sales-status/${id}/toggle-active`,
        method: "PATCH",
      }),
      invalidatesTags: ["SalesStatus", "SalesStatusStats"],
    }),

    // Update sequence
    updateStatusSequence: builder.mutation<
      SalesStatus,
      { id: string; sequence: number }
    >({
      query: ({ id, sequence }) => ({
        url: `/sales-status/${id}/sequence`,
        method: "PATCH",
        body: { sequence },
      }),
      invalidatesTags: ["SalesStatus"],
    }),

    // Reorder statuses
    reorderStatuses: builder.mutation<boolean, StatusOrder[]>({
      query: (statusOrders) => ({
        url: "/sales-status/reorder",
        method: "POST",
        body: { statusOrders },
      }),
      invalidatesTags: ["SalesStatus"],
    }),

    // Bulk update
    bulkUpdateStatuses: builder.mutation<
      { matched: number; modified: number },
      BulkStatusUpdateDto
    >({
      query: (data) => ({
        url: "/sales-status/bulk-update",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SalesStatus", "SalesStatusStats"],
    }),

    // Get statistics
    getSalesStatusStatistics: builder.query({
      query: () => "/sales-status/stats/summary",
      providesTags: ["SalesStatusStats"],
    }),

    // Get status workflow
    getStatusWorkflow: builder.query({
      query: (id) => `/sales-status/${id}/workflow`,
    }),

    // Get next statuses
    getNextStatuses: builder.query<SalesStatus[], string>({
      query: (id) => `/sales-status/${id}/next-statuses`,
    }),

    // Validate transition
    validateStatusTransition: builder.mutation({
      query: (data: WorkflowValidationDto) => ({
        url: "/sales-status/validate-transition",
        method: "POST",
        body: data,
      }),
    }),

    // Check sales allowed
    checkSalesAllowed: builder.query<boolean, string>({
      query: (id) => `/sales-status/${id}/check-sales-allowed`,
      transformResponse: (response: any) => response.data.allowsSale,
    }),

    // Check requires approval
    checkRequiresApproval: builder.query<boolean, string>({
      query: (id) => `/sales-status/${id}/check-requires-approval`,
      transformResponse: (response: any) => response.data.requiresApproval,
    }),
  }),
});

export const {
  useGetSalesStatusesQuery,
  useGetSalesStatusQuery,
  useGetSalesStatusByCodeQuery,
  useGetActiveSalesStatusesQuery,
  useGetDefaultSalesStatusQuery,
  useGetSalesAllowedStatusesQuery,
  useGetStatusesByTypeQuery,
  useCreateSalesStatusMutation,
  useUpdateSalesStatusMutation,
  useDeleteSalesStatusMutation,
  useToggleStatusActiveMutation,
  useUpdateStatusSequenceMutation,
  useReorderStatusesMutation,
  useBulkUpdateStatusesMutation,
  useGetSalesStatusStatisticsQuery,
  useGetStatusWorkflowQuery,
  useGetNextStatusesQuery,
  useValidateStatusTransitionMutation,
  useCheckSalesAllowedQuery,
  useCheckRequiresApprovalQuery,
} = salesStatusApi;
