// src/lib/API/applicationApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  Application,
  ApplicationQueryParams,
  ApplicationSummary,
  CreateApplicationDto,
  UpdateApplicationDto,
} from "../types/application";

export const applicationApi = createApi({
  reducerPath: "applicationApi",
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
  tagTypes: ["Application"],
  endpoints: (builder) => ({
    // Get all applications with pagination
    getApplications: builder.query<
      ApiResponse<{
        applications: Application[];
        pagination: PaginatedResponse<Application>["pagination"];
      }>,
      ApplicationQueryParams
    >({
      query: (params) => ({
        url: "/application",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.applications.map(({ _id }) => ({
                type: "Application" as const,
                id: _id,
              })),
              { type: "Application", id: "LIST" },
            ]
          : [{ type: "Application", id: "LIST" }],
    }),

    // Get application by ID
    getApplicationById: builder.query<ApiResponse<Application>, string>({
      query: (id) => `/application/${id}`,
      providesTags: (result, error, id) => [{ type: "Application", id }],
    }),

    // Get applications by type
    getApplicationsByType: builder.query<ApiResponse<Application[]>, string>({
      query: (typeId) => `/application/type/${typeId}`,
      providesTags: (result) =>
        result
          ? result.data.map(({ _id }) => ({
              type: "Application" as const,
              id: _id,
            }))
          : [],
    }),

    // Get recent applications
    getRecentApplications: builder.query<
      ApiResponse<Application[]>,
      { limit?: number }
    >({
      query: (params) => ({
        url: "/application/recent",
        params,
      }),
      providesTags: (result) =>
        result
          ? result.data.map(({ _id }) => ({
              type: "Application" as const,
              id: _id,
            }))
          : [],
    }),

    // Get application summary
    getApplicationSummary: builder.query<ApiResponse<ApplicationSummary>, void>(
      {
        query: () => "/application/summary",
      },
    ),

    // Create application
    createApplication: builder.mutation<
      ApiResponse<Application>,
      CreateApplicationDto
    >({
      query: (data) => ({
        url: "/application",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Application", id: "LIST" }],
    }),

    // Update application
    updateApplication: builder.mutation<
      ApiResponse<Application>,
      { id: string; data: UpdateApplicationDto }
    >({
      query: ({ id, data }) => ({
        url: `/application/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Application", id },
        { type: "Application", id: "LIST" },
      ],
    }),

    // Delete application
    deleteApplication: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/application/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Application", id },
        { type: "Application", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useGetApplicationsByTypeQuery,
  useGetRecentApplicationsQuery,
  useGetApplicationSummaryQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
  useLazyGetApplicationsQuery,
  useLazyGetRecentApplicationsQuery,
} = applicationApi;
