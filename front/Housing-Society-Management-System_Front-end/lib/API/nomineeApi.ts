// src/lib/API/nomineeApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  CreateNomineeDto,
  Nominee,
  NomineeQueryParams,
  NomineeStatistics,
  NomineeSummary,
  RelationType,
  ShareDistribution,
  UpdateNomineeDto,
} from "../types/nominee";

export const nomineeApi = createApi({
  reducerPath: "nomineeApi",
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
  tagTypes: ["Nominee"],
  endpoints: (builder) => ({
    // Get all nominees with pagination
    getNominees: builder.query<
      ApiResponse<{
        nominees: Nominee[];
        pagination: PaginatedResponse<Nominee>["pagination"];
      }>,
      NomineeQueryParams
    >({
      query: (params) => ({
        url: "/nominee",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.nominees.map(({ _id }) => ({ type: "Nominee" as const, id: _id })),
              { type: "Nominee", id: "LIST" },
            ]
          : [{ type: "Nominee", id: "LIST" }],
    }),

    // Get nominee by ID
    getNomineeById: builder.query<ApiResponse<Nominee>, string>({
      query: (id) => `/nominee/${id}`,
      providesTags: (result, error, id) => [{ type: "Nominee", id }],
    }),

    // Get nominee by CNIC
    getNomineeByCNIC: builder.query<ApiResponse<Nominee>, string>({
      query: (cnic) => `/nominee/cnic/${cnic}`,
      providesTags: (result, error, cnic) => [{ type: "Nominee", id: `cnic-${cnic}` }],
    }),

    // Get nominees by member
    getNomineesByMember: builder.query<ApiResponse<Nominee[]>, { memId: string; activeOnly?: boolean }>({
      query: ({ memId, activeOnly = true }) => ({
        url: `/nominee/member/${memId}`,
        params: { activeOnly },
      }),
      providesTags: (result, error, { memId }) => [{ type: "Nominee", id: `member-${memId}` }],
    }),

    // Get member share coverage
    getMemberShareCoverage: builder.query<
      ApiResponse<{
        totalShare: number;
        coveragePercentage: number;
        isFullyCovered: boolean;
        nominees: Nominee[];
      }>,
      string
    >({
      query: (memId) => `/nominee/member/${memId}/coverage`,
      providesTags: (result, error, memId) => [{ type: "Nominee", id: `coverage-${memId}` }],
    }),

    // Get nominee statistics
    getNomineeStatistics: builder.query<ApiResponse<NomineeStatistics>, void>({
      query: () => "/nominee/statistics",
    }),

    // Get nominee summary
    getNomineeSummary: builder.query<ApiResponse<NomineeSummary>, void>({
      query: () => "/nominee/summary",
    }),

    // Get share distribution
    getShareDistribution: builder.query<ApiResponse<ShareDistribution[]>, void>({
      query: () => "/nominee/share-distribution",
    }),

    // Get members without full coverage
    getMembersWithoutFullCoverage: builder.query<
      ApiResponse<
        Array<{
          memberId: string;
          memberName: string;
          totalShare: number;
          nomineesCount: number;
        }>
      >,
      void
    >({
      query: () => "/nominee/members-without-coverage",
    }),

    // Get nominee dropdown
    getNomineesDropdown: builder.query<
      ApiResponse<
        Array<{
          value: string;
          label: string;
          nomineeName: string;
          relation: RelationType;
          sharePercentage: number;
          cnic: string;
        }>
      >,
      { memId?: string }
    >({
      query: (params) => ({
        url: "/nominee/dropdown",
        params,
      }),
    }),

    // Search nominees
    searchNominees: builder.query<ApiResponse<Nominee[]>, { q: string; limit?: number }>({
      query: (params) => ({
        url: "/nominee/search",
        params,
      }),
      providesTags: (result) =>
        result
          ? result.data.map(({ _id }) => ({ type: "Nominee" as const, id: _id }))
          : [],
    }),

    // Validate nominee data
    validateNomineeData: builder.mutation<
      ApiResponse<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
      }>,
      CreateNomineeDto | UpdateNomineeDto
    >({
      query: (data) => ({
        url: "/nominee/validate",
        method: "POST",
        body: data,
      }),
    }),

    // Create nominee
    createNominee: builder.mutation<ApiResponse<Nominee>, CreateNomineeDto>({
      query: (data) => ({
        url: "/nominee",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Nominee", id: "LIST" }],
    }),

    // Update nominee
    updateNominee: builder.mutation<
      ApiResponse<Nominee>,
      { id: string; data: UpdateNomineeDto }
    >({
      query: ({ id, data }) => ({
        url: `/nominee/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Nominee", id },
        { type: "Nominee", id: "LIST" },
      ],
    }),

    // Delete nominee
    deleteNominee: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/nominee/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Nominee", id },
        { type: "Nominee", id: "LIST" },
      ],
    }),

    // Bulk update status
    bulkUpdateStatus: builder.mutation<
      ApiResponse<{ matched: number; modified: number }>,
      { nomineeIds: string[]; isActive: boolean }
    >({
      query: (data) => ({
        url: "/nominee/bulk/update-status",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Nominee", id: "LIST" }],
    }),
  }),
});

export const {
  useGetNomineesQuery,
  useGetNomineeByIdQuery,
  useGetNomineeByCNICQuery,
  useGetNomineesByMemberQuery,
  useGetMemberShareCoverageQuery,
  useGetNomineeStatisticsQuery,
  useGetNomineeSummaryQuery,
  useGetShareDistributionQuery,
  useGetMembersWithoutFullCoverageQuery,
  useGetNomineesDropdownQuery,
  useSearchNomineesQuery,
  useValidateNomineeDataMutation,
  useCreateNomineeMutation,
  useUpdateNomineeMutation,
  useDeleteNomineeMutation,
  useBulkUpdateStatusMutation,
  useLazyGetNomineesQuery,
  useLazySearchNomineesQuery,
  useLazyGetNomineesByMemberQuery,
} = nomineeApi;
