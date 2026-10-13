// src/lib/API/installmentApi.ts - Updated version
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  BulkInstallmentCreationDto,
  BulkStatusUpdateDto,
  CreateInstallmentDto,
  Installment,
  InstallmentDashboardSummary,
  InstallmentQueryParams,
  InstallmentReport,
  InstallmentReportParams,
  InstallmentSummary,
  PaymentValidation,
  RecordPaymentDto,
  UpdateInstallmentDto,
} from "../types/installment";

export const installmentApi = createApi({
  reducerPath: "installmentApi",
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
  tagTypes: ["Installment"],
  endpoints: (builder) => ({
    // Get all installments with pagination
    getInstallments: builder.query<
      ApiResponse<{
        installments: Installment[];
        pagination: PaginatedResponse<Installment>["pagination"];
      }>,
      InstallmentQueryParams
    >({
      query: (params) => ({
        url: "/installment",
        params: {
          ...params,
          fromDate:
            params.fromDate instanceof Date
              ? params.fromDate.toISOString()
              : params.fromDate,
          toDate:
            params.toDate instanceof Date
              ? params.toDate.toISOString()
              : params.toDate,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.installments.map(({ _id }) => ({
                type: "Installment" as const,
                id: _id,
              })),
              { type: "Installment", id: "LIST" },
            ]
          : [{ type: "Installment", id: "LIST" }],
    }),

    // Get installment by ID
    getInstallmentById: builder.query<ApiResponse<Installment>, string>({
      query: (id) => `/installment/${id}`,
      providesTags: (result, error, id) => [{ type: "Installment", id }],
    }),

    // Get installments by file
    getInstallmentsByFile: builder.query<ApiResponse<Installment[]>, string>({
      query: (fileId) => `/installment/file/${fileId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Installment" as const,
                id: _id,
              })),
              { type: "Installment", id: "LIST" },
            ]
          : [{ type: "Installment", id: "LIST" }],
    }),

    // Get installments by member
    getInstallmentsByMember: builder.query<ApiResponse<Installment[]>, string>({
      query: (memId) => `/installment/member/${memId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Installment" as const,
                id: _id,
              })),
              { type: "Installment", id: "LIST" },
            ]
          : [{ type: "Installment", id: "LIST" }],
    }),

    // Get installments by plot
    getInstallmentsByPlot: builder.query<ApiResponse<Installment[]>, string>({
      query: (plotId) => `/installment/plot/${plotId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Installment" as const,
                id: _id,
              })),
              { type: "Installment", id: "LIST" },
            ]
          : [{ type: "Installment", id: "LIST" }],
    }),

    // Get overdue installments
    getOverdueInstallments: builder.query<ApiResponse<Installment[]>, void>({
      query: () => "/installment/overdue",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Installment" as const,
                id: _id,
              })),
              { type: "Installment", id: "LIST" },
            ]
          : [{ type: "Installment", id: "LIST" }],
    }),

    // Get due today installments
    getDueTodayInstallments: builder.query<ApiResponse<Installment[]>, void>({
      query: () => "/installment/due-today",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Installment" as const,
                id: _id,
              })),
              { type: "Installment", id: "LIST" },
            ]
          : [{ type: "Installment", id: "LIST" }],
    }),

    // Get installment summary for member
    getInstallmentSummary: builder.query<
      ApiResponse<InstallmentSummary>,
      string
    >({
      query: (memId) => `/installment/member/${memId}/summary`,
    }),

    // Get dashboard summary
    getDashboardSummary: builder.query<
      ApiResponse<InstallmentDashboardSummary>,
      void
    >({
      query: () => "/installment/dashboard-summary",
    }),

    // Get next due installment for member
    getNextDueInstallment: builder.query<ApiResponse<Installment>, string>({
      query: (memId) => `/installment/member/${memId}/next-due`,
      providesTags: (result, error, memId) => [
        { type: "Installment", id: `member-${memId}-next-due` },
      ],
    }),

    // Search installments
    searchInstallments: builder.query<
      ApiResponse<Installment[]>,
      { q: string; limit?: number }
    >({
      query: (params) => ({
        url: "/installment/search",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Installment" as const,
                id: _id,
              })),
              { type: "Installment", id: "LIST" },
            ]
          : [{ type: "Installment", id: "LIST" }],
    }),

    // Generate installment report
    generateReport: builder.query<
      ApiResponse<InstallmentReport>,
      InstallmentReportParams
    >({
      query: (params) => ({
        url: "/installment/report",
        params: {
          ...params,
          startDate:
            params.startDate instanceof Date
              ? params.startDate.toISOString()
              : params.startDate,
          endDate:
            params.endDate instanceof Date
              ? params.endDate.toISOString()
              : params.endDate,
        },
      }),
    }),

    // Create installment
    createInstallment: builder.mutation<
      ApiResponse<Installment>,
      CreateInstallmentDto
    >({
      query: (data) => ({
        url: "/installment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Installment", id: "LIST" }],
    }),

    // Create bulk installments
    createBulkInstallments: builder.mutation<
      ApiResponse<Installment[]>,
      BulkInstallmentCreationDto
    >({
      query: (data) => ({
        url: "/installment/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Installment", id: "LIST" }],
    }),

    // Update installment
    updateInstallment: builder.mutation<
      ApiResponse<Installment>,
      { id: string; data: UpdateInstallmentDto }
    >({
      query: ({ id, data }) => ({
        url: `/installment/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Installment", id },
        { type: "Installment", id: "LIST" },
      ],
    }),

    // Delete installment
    deleteInstallment: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/installment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Installment", id },
        { type: "Installment", id: "LIST" },
      ],
    }),

    // Record payment
    recordPayment: builder.mutation<
      ApiResponse<Installment>,
      { id: string; data: RecordPaymentDto }
    >({
      query: ({ id, data }) => ({
        url: `/installment/${id}/payment`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Installment", id },
        { type: "Installment", id: "LIST" },
      ],
    }),

    // Bulk update status
    bulkUpdateStatus: builder.mutation<
      ApiResponse<{ matched: number; modified: number }>,
      BulkStatusUpdateDto
    >({
      query: (data) => ({
        url: "/installment/bulk/update-status",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Installment", id: "LIST" }],
    }),

    // Validate payment
    validatePayment: builder.query<
      ApiResponse<PaymentValidation>,
      { id: string; amount: number }
    >({
      query: ({ id, amount }) => ({
        url: `/installment/${id}/validate-payment`,
        params: { amount },
      }),
    }),
  }),
});

export const {
  useGetInstallmentsQuery,
  useGetInstallmentByIdQuery,
  useGetInstallmentsByFileQuery,
  useGetInstallmentsByMemberQuery,
  useGetInstallmentsByPlotQuery,
  useGetOverdueInstallmentsQuery,
  useGetDueTodayInstallmentsQuery,
  useGetInstallmentSummaryQuery,
  useGetDashboardSummaryQuery,
  useGetNextDueInstallmentQuery,
  useSearchInstallmentsQuery,
  useGenerateReportQuery,
  useCreateInstallmentMutation,
  useCreateBulkInstallmentsMutation,
  useUpdateInstallmentMutation,
  useDeleteInstallmentMutation,
  useRecordPaymentMutation,
  useBulkUpdateStatusMutation,
  useValidatePaymentQuery,
  useLazyGetInstallmentsQuery,
  useLazySearchInstallmentsQuery,
  useLazyGenerateReportQuery,
  useLazyValidatePaymentQuery,
} = installmentApi;
