// src/lib/API/srApplicationTypeApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  CreateSrApplicationTypeDto,
  SrApplicationType,
  SrApplicationTypeQueryParams,
  UpdateSrApplicationTypeDto,
} from "../types/srApplicationType";

export const srApplicationTypeApi = createApi({
  reducerPath: "srApplicationTypeApi",
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
  tagTypes: ["SrApplicationType"],
  endpoints: (builder) => ({
    // Get all SR application types with pagination
    getSrApplicationTypes: builder.query<
      ApiResponse<{
        srApplicationTypes: SrApplicationType[];
        pagination: PaginatedResponse<SrApplicationType>["pagination"];
      }>,
      SrApplicationTypeQueryParams
    >({
      query: (params) => ({
        url: "/applicationtype",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.srApplicationTypes.map(({ _id }) => ({
                type: "SrApplicationType" as const,
                id: _id,
              })),
              { type: "SrApplicationType", id: "LIST" },
            ]
          : [{ type: "SrApplicationType", id: "LIST" }],
    }),

    // Get all SR application types (for dropdown)
    getAllSrApplicationTypes: builder.query<
      ApiResponse<SrApplicationType[]>,
      void
    >({
      query: () => "/applicationtype/all",
      providesTags: [{ type: "SrApplicationType", id: "LIST" }],
    }),

    // Get SR application type by ID
    getSrApplicationTypeById: builder.query<
      ApiResponse<SrApplicationType>,
      string
    >({
      query: (id) => `/applicationtype/${id}`,
      providesTags: (result, error, id) => [{ type: "SrApplicationType", id }],
    }),

    // Create SR application type
    createSrApplicationType: builder.mutation<
      ApiResponse<SrApplicationType>,
      CreateSrApplicationTypeDto
    >({
      query: (data) => ({
        url: "/applicationtype",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "SrApplicationType", id: "LIST" }],
    }),

    // Update SR application type
    updateSrApplicationType: builder.mutation<
      ApiResponse<SrApplicationType>,
      { id: string; data: UpdateSrApplicationTypeDto }
    >({
      query: ({ id, data }) => ({
        url: `/applicationtype/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SrApplicationType", id },
        { type: "SrApplicationType", id: "LIST" },
      ],
    }),

    // Delete SR application type
    deleteSrApplicationType: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/applicationtype/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "SrApplicationType", id },
        { type: "SrApplicationType", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSrApplicationTypesQuery,
  useGetAllSrApplicationTypesQuery,
  useGetSrApplicationTypeByIdQuery,
  useCreateSrApplicationTypeMutation,
  useUpdateSrApplicationTypeMutation,
  useDeleteSrApplicationTypeMutation,
  useLazyGetSrApplicationTypesQuery,
} = srApplicationTypeApi;
