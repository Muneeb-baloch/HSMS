// src/lib/API/transferTypeApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  CommonTransferType,
  CreateTransferTypeDto,
  FeeCalculationResult,
  TransferType,
  TransferTypeDropdown,
  TransferTypeQueryParams,
  TransferTypeStatistics,
  TransferTypeSummary,
  UpdateTransferTypeDto,
} from "../types/transfer-type";

export const transferTypeApi = createApi({
  reducerPath: "transferTypeApi",
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
  tagTypes: ["TransferType"],
  endpoints: (builder) => ({
    // Get all transfer types with pagination
    getTransferTypes: builder.query<
      ApiResponse<{
        transferTypes: TransferType[];
        pagination: PaginatedResponse<TransferType>["pagination"];
      }>,
      TransferTypeQueryParams
    >({
      query: (params) => ({
        url: "/transfertype",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.transferTypes.map(({ _id }) => ({
                type: "TransferType" as const,
                id: _id,
              })),
              { type: "TransferType", id: "LIST" },
            ]
          : [{ type: "TransferType", id: "LIST" }],
    }),

    // Get transfer type by ID
    getTransferTypeById: builder.query<ApiResponse<TransferType>, string>({
      query: (id) => `/transfertype/${id}`,
      providesTags: (result, error, id) => [{ type: "TransferType", id }],
    }),

    // Get transfer type by name
    getTransferTypeByName: builder.query<ApiResponse<TransferType>, string>({
      query: (name) => `/transfertype/name/${name}`,
      providesTags: (result) =>
        result ? [{ type: "TransferType", id: result.data._id }] : [],
    }),

    // Get active transfer types
    getActiveTransferTypes: builder.query<ApiResponse<TransferType[]>, void>({
      query: () => "/transfertype/active",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "TransferType" as const,
                id: _id,
              })),
              { type: "TransferType", id: "ACTIVE_LIST" },
            ]
          : [{ type: "TransferType", id: "ACTIVE_LIST" }],
    }),

    // Get transfer types dropdown
    getTransferTypesDropdown: builder.query<
      ApiResponse<TransferTypeDropdown[]>,
      void
    >({
      query: () => "/transfertype/dropdown",
      providesTags: [{ type: "TransferType", id: "DROPDOWN" }],
    }),

    // Get common transfer types
    getCommonTransferTypes: builder.query<
      ApiResponse<CommonTransferType[]>,
      void
    >({
      query: () => "/transfertype/common-types",
    }),

    // Get transfer type statistics
    getTransferTypeStatistics: builder.query<
      ApiResponse<TransferTypeStatistics>,
      void
    >({
      query: () => "/transfertype/statistics",
    }),

    // Get transfer type summary for dashboard
    getTransferTypeSummary: builder.query<
      ApiResponse<TransferTypeSummary>,
      void
    >({
      query: () => "/transfertype/summary",
    }),

    // Search transfer types
    searchTransferTypes: builder.query<
      ApiResponse<TransferType[]>,
      { q: string; limit?: number }
    >({
      query: (params) => ({
        url: "/transfertype/search",
        params,
      }),
      providesTags: (result) =>
        result
          ? result.data.map(({ _id }) => ({
              type: "TransferType" as const,
              id: _id,
            }))
          : [],
    }),

    // Calculate transfer fee
    calculateFee: builder.query<
      ApiResponse<FeeCalculationResult>,
      {
        transferTypeId: string;
        propertyValue?: number;
        applyDiscount?: boolean;
        discountPercentage?: number;
      }
    >({
      query: ({ transferTypeId, ...params }) => ({
        url: `/transfertype/${transferTypeId}/calculate-fee`,
        params,
      }),
    }),

    // Validate transfer type configuration
    validateConfiguration: builder.query<
      ApiResponse<{
        isValid: boolean;
        issues: string[];
        suggestions: string[];
      }>,
      string
    >({
      query: (id) => `/transfertype/${id}/validate`,
    }),

    // Create transfer type
    createTransferType: builder.mutation<
      ApiResponse<TransferType>,
      CreateTransferTypeDto
    >({
      query: (data) => ({
        url: "/transfertype",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "TransferType", id: "LIST" },
        { type: "TransferType", id: "ACTIVE_LIST" },
        { type: "TransferType", id: "DROPDOWN" },
      ],
    }),

    // Update transfer type
    updateTransferType: builder.mutation<
      ApiResponse<TransferType>,
      { id: string; data: UpdateTransferTypeDto }
    >({
      query: ({ id, data }) => ({
        url: `/transfertype/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "TransferType", id },
        { type: "TransferType", id: "LIST" },
        { type: "TransferType", id: "ACTIVE_LIST" },
        { type: "TransferType", id: "DROPDOWN" },
      ],
    }),

    // Delete transfer type (soft delete)
    deleteTransferType: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/transfertype/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "TransferType", id },
        { type: "TransferType", id: "LIST" },
        { type: "TransferType", id: "ACTIVE_LIST" },
        { type: "TransferType", id: "DROPDOWN" },
      ],
    }),

    // Bulk update transfer type status
    bulkUpdateStatus: builder.mutation<
      ApiResponse<{ matched: number; modified: number }>,
      { transferTypeIds: string[]; isActive: boolean }
    >({
      query: (data) => ({
        url: "/transfertype/bulk/update-status",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "TransferType", id: "LIST" },
        { type: "TransferType", id: "ACTIVE_LIST" },
        { type: "TransferType", id: "DROPDOWN" },
      ],
    }),

    // Update transfer fees by percentage
    updateFeesByPercentage: builder.mutation<
      ApiResponse<{ updated: number; averageFee: number }>,
      { percentage: number }
    >({
      query: (data) => ({
        url: "/transfertype/update-fees-percentage",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "TransferType", id: "LIST" },
        { type: "TransferType", id: "ACTIVE_LIST" },
        { type: "TransferType", id: "DROPDOWN" },
      ],
    }),
  }),
});

export const {
  useGetTransferTypesQuery,
  useLazyGetTransferTypesQuery,
  useGetTransferTypeByIdQuery,
  useGetTransferTypeByNameQuery,
  useGetActiveTransferTypesQuery,
  useGetTransferTypesDropdownQuery,
  useGetCommonTransferTypesQuery,
  useGetTransferTypeStatisticsQuery,
  useGetTransferTypeSummaryQuery,
  useSearchTransferTypesQuery,
  useLazySearchTransferTypesQuery,
  useCalculateFeeQuery,
  useLazyCalculateFeeQuery,
  useValidateConfigurationQuery,
  useCreateTransferTypeMutation,
  useUpdateTransferTypeMutation,
  useDeleteTransferTypeMutation,
  useBulkUpdateStatusMutation,
  useUpdateFeesByPercentageMutation,
} = transferTypeApi;
