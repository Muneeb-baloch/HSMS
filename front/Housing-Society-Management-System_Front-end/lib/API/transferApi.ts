import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  CreateTransferDto,
  ExecuteTransferDto,
  RecordFeePaymentDto,
  Transfer,
  TransferDashboardSummary,
  TransferQueryParams,
  TransferStatistics,
  UpdateTransferDto,
} from "../types/transfer.types";

export const transferApi = createApi({
  reducerPath: "transferApi",
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
  tagTypes: ["Transfer"],
  endpoints: (builder) => ({
    // Get paginated transfers
    getTransfers: builder.query<
      PaginatedResponse<Transfer>,
      TransferQueryParams
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
        return `/transfer?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ _id }) => ({
                type: "Transfer" as const,
                id: _id,
              })),
              { type: "Transfer", id: "LIST" },
            ]
          : [{ type: "Transfer", id: "LIST" }],
      transformResponse: (
        response: ApiResponse<{
          transfers: Transfer[];
          pagination: PaginatedResponse<Transfer>["pagination"];
        }>,
      ) => ({
        items: response.data.transfers,
        pagination: response.data.pagination,
      }),
    }),

    // Get single transfer
    getTransferById: builder.query<Transfer, string>({
      query: (id) => `/transfer/${id}`,
      transformResponse: (response: ApiResponse<Transfer>) => response.data,
      providesTags: (result, error, id) => [{ type: "Transfer", id }],
    }),

    // Create transfer
    createTransfer: builder.mutation<Transfer, CreateTransferDto>({
      query: (data) => ({
        url: "/transfer",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Transfer>) => response.data,
      invalidatesTags: [{ type: "Transfer", id: "LIST" }],
    }),

    // Update transfer
    updateTransfer: builder.mutation<
      Transfer,
      { id: string; data: UpdateTransferDto }
    >({
      query: ({ id, data }) => ({
        url: `/transfer/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Transfer>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Transfer", id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    // Delete transfer
    deleteTransfer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/transfer/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Transfer", id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    // Record fee payment
    recordFeePayment: builder.mutation<
      Transfer,
      { id: string; data: RecordFeePaymentDto }
    >({
      query: ({ id, data }) => ({
        url: `/transfer/${id}/pay-fee`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Transfer>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Transfer", id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    // Execute transfer
    executeTransfer: builder.mutation<
      Transfer,
      { id: string; data: ExecuteTransferDto }
    >({
      query: ({ id, data }) => ({
        url: `/transfer/${id}/execute`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Transfer>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Transfer", id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    // Get transfers by file
    getTransfersByFile: builder.query<Transfer[], string>({
      query: (fileId) => `/transfer/file/${fileId}`,
      transformResponse: (response: ApiResponse<Transfer[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Transfer" as const,
                id: _id,
              })),
              { type: "Transfer", id: "LIST" },
            ]
          : [{ type: "Transfer", id: "LIST" }],
    }),

    // Get transfers by member
    getTransfersByMember: builder.query<Transfer[], string>({
      query: (memId) => `/transfer/member/${memId}`,
      transformResponse: (response: ApiResponse<Transfer[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Transfer" as const,
                id: _id,
              })),
              { type: "Transfer", id: "LIST" },
            ]
          : [{ type: "Transfer", id: "LIST" }],
    }),

    // Get pending transfers
    getPendingTransfers: builder.query<
      PaginatedResponse<Transfer>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) =>
        `/transfer/pending?page=${page}&limit=${limit}`,
      transformResponse: (
        response: ApiResponse<{
          transfers: Transfer[];
          pagination: PaginatedResponse<Transfer>["pagination"];
        }>,
      ) => ({
        items: response.data.transfers,
        pagination: response.data.pagination,
      }),
    }),

    // Get transfer statistics
    getTransferStatistics: builder.query<TransferStatistics, void>({
      query: () => "/transfer/statistics",
      transformResponse: (response: ApiResponse<TransferStatistics>) =>
        response.data,
      providesTags: [{ type: "Transfer", id: "STATS" }],
    }),

    // Get dashboard summary
    getDashboardSummary: builder.query<TransferDashboardSummary, void>({
      query: () => "/transfer/dashboard-summary",
      transformResponse: (response: ApiResponse<TransferDashboardSummary>) =>
        response.data,
      providesTags: [{ type: "Transfer", id: "DASHBOARD" }],
    }),

    // Get overdue transfers
    getOverdueTransfers: builder.query<Transfer[], void>({
      query: () => "/transfer/overdue",
      transformResponse: (response: ApiResponse<Transfer[]>) => response.data,
    }),

    // Get transfers requiring action
    getTransfersRequiringAction: builder.query<
      {
        feePending: Transfer[];
        documentsPending: Transfer[];
        reviewPending: Transfer[];
        ndcPending: Transfer[];
      },
      void
    >({
      query: () => "/transfer/requiring-action",
      transformResponse: (
        response: ApiResponse<{
          feePending: Transfer[];
          documentsPending: Transfer[];
          reviewPending: Transfer[];
          ndcPending: Transfer[];
        }>,
      ) => response.data,
    }),

    // Search transfers
    searchTransfers: builder.query<
      Transfer[],
      { query: string; limit?: number }
    >({
      query: ({ query, limit = 10 }) =>
        `/transfer/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      transformResponse: (response: ApiResponse<Transfer[]>) => response.data,
    }),

    // Get transfer timeline
    getTransferTimeline: builder.query<any[], string>({
      query: (id) => `/transfer/${id}/timeline`,
      transformResponse: (response: ApiResponse<any[]>) => response.data,
      providesTags: (result, error, id) => [
        { type: "Transfer", id: `TIMELINE-${id}` },
      ],
    }),

    // Validate transfer for completion
    validateTransferForCompletion: builder.query<
      {
        isValid: boolean;
        requirements: string[];
        missing: string[];
      },
      string
    >({
      query: (id) => `/transfer/${id}/validate`,
      transformResponse: (
        response: ApiResponse<{
          isValid: boolean;
          requirements: string[];
          missing: string[];
        }>,
      ) => response.data,
    }),

    // Upload NDC document
    uploadNDCDocument: builder.mutation<Transfer, { id: string; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("ndcDocument", file);

        return {
          url: `/transfer/${id}/upload-ndc`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<Transfer>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Transfer", id },
        { type: "Transfer", id: "LIST" },
      ],
    }),

    // Bulk update status
    bulkUpdateStatus: builder.mutation<
      { matched: number; modified: number },
      { transferIds: string[]; status: string }
    >({
      query: ({ transferIds, status }) => ({
        url: "/transfer/bulk/update-status",
        method: "POST",
        body: { transferIds, status },
      }),
      invalidatesTags: [{ type: "Transfer", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTransfersQuery,
  useLazyGetTransfersQuery,
  useGetTransferByIdQuery,
  useCreateTransferMutation,
  useUpdateTransferMutation,
  useDeleteTransferMutation,
  useRecordFeePaymentMutation,
  useExecuteTransferMutation,
  useGetTransfersByFileQuery,
  useGetTransfersByMemberQuery,
  useGetPendingTransfersQuery,
  useGetTransferStatisticsQuery,
  useGetDashboardSummaryQuery,
  useGetOverdueTransfersQuery,
  useGetTransfersRequiringActionQuery,
  useSearchTransfersQuery,
  useGetTransferTimelineQuery,
  useValidateTransferForCompletionQuery,
  useUploadNDCDocumentMutation,
  useBulkUpdateStatusMutation,
} = transferApi;
