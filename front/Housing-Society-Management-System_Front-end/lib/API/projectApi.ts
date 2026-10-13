// src/lib/API/projectApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../types/api";
import { Project, ProjectStats } from "../types/project";

export const projectApi = createApi({
  reducerPath: "projectApi",
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
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProjects: builder.query<
      ApiResponse<any>,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
        status?: string;
        type?: string;
        isActive?: boolean;
        cityId?: string;
        country?: string;
        minPlots?: number;
        maxPlots?: number;
        minArea?: number;
        maxArea?: number;
        launchedAfter?: string;
        launchedBefore?: string;
      }
    >({
      query: (params) => ({
        url: "/projects",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          sortBy: params.sortBy || "createdAt",
          sortOrder: params.sortOrder || "desc",
          status: params.status,
          type: params.type,
          isActive: params.isActive,
          cityId: params.cityId,
          country: params.country,
          minPlots: params.minPlots,
          maxPlots: params.maxPlots,
          minArea: params.minArea,
          maxArea: params.maxArea,
          launchedAfter: params.launchedAfter,
          launchedBefore: params.launchedBefore,
        },
      }),
      providesTags: ["Project"],
    }),

    getProjectById: builder.query<ApiResponse<Project>, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    getProjectByCode: builder.query<ApiResponse<Project>, string>({
      query: (code) => `/projects/code/${code}`,
      providesTags: ["Project"],
    }),

    getActiveProjects: builder.query<ApiResponse<Project[]>, void>({
      query: () => "/projects/active",
      providesTags: ["Project"],
    }),

    createProject: builder.mutation<ApiResponse<Project>, any>({
      query: (data) => ({
        url: "/projects",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    updateProject: builder.mutation<
      ApiResponse<Project>,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),

    deleteProject: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    toggleProjectStatus: builder.mutation<ApiResponse<Project>, string>({
      query: (id) => ({
        url: `/projects/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Project"],
    }),

    updateProjectStatus: builder.mutation<
      ApiResponse<Project>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/projects/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Project"],
    }),

    getProjectStatistics: builder.query<ApiResponse<ProjectStats>, void>({
      query: () => "/projects/statistics",
    }),

    getProjectsByCityId: builder.query<ApiResponse<Project[]>, string>({
      query: (cityId) => `/projects/city/id/${cityId}`,
      providesTags: ["Project"],
    }),

    getProjectsByStatus: builder.query<ApiResponse<Project[]>, string>({
      query: (status) => `/projects/status/${status}`,
      providesTags: ["Project"],
    }),

    generateNextPlotNumber: builder.query<
      ApiResponse<{ nextPlotNumber: string }>,
      string
    >({
      query: (projectId) => `/projects/${projectId}/next-plot-number`,
    }),

    incrementPlotCount: builder.mutation<
      ApiResponse<Project>,
      {
        projectId: string;
        type: "sold" | "reserved";
        count?: number;
      }
    >({
      query: ({ projectId, type, count }) => ({
        url: `/projects/${projectId}/plots/increment`,
        method: "POST",
        body: { type, count },
      }),
      invalidatesTags: ["Project"],
    }),

    decrementPlotCount: builder.mutation<
      ApiResponse<Project>,
      {
        projectId: string;
        type: "sold" | "reserved";
        count?: number;
      }
    >({
      query: ({ projectId, type, count }) => ({
        url: `/projects/${projectId}/plots/decrement`,
        method: "POST",
        body: { type, count },
      }),
      invalidatesTags: ["Project"],
    }),

    searchProjectsNearLocation: builder.query<
      ApiResponse<Project[]>,
      {
        latitude: number;
        longitude: number;
        maxDistance?: number;
      }
    >({
      query: ({ latitude, longitude, maxDistance }) => ({
        url: "/projects/location/near",
        params: { latitude, longitude, maxDistance },
      }),
    }),

    getProjectsWithLowAvailability: builder.query<
      ApiResponse<Project[]>,
      { threshold?: number }
    >({
      query: ({ threshold = 10 } = {}) => ({
        url: "/projects/low-availability",
        params: { threshold },
      }),
    }),

    bulkUpdateProjectStatus: builder.mutation<
      ApiResponse<any>,
      {
        projectIds: string[];
        status: string;
      }
    >({
      query: ({ projectIds, status }) => ({
        url: "/projects/bulk/status",
        method: "POST",
        body: { projectIds, status },
      }),
      invalidatesTags: ["Project"],
    }),

    getProjectTimeline: builder.query<ApiResponse<any[]>, string>({
      query: (projectId) => `/projects/${projectId}/timeline`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useGetProjectByCodeQuery,
  useGetActiveProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useToggleProjectStatusMutation,
  useUpdateProjectStatusMutation,
  useGetProjectStatisticsQuery,
  useGetProjectsByCityIdQuery,
  useGetProjectsByStatusQuery,
  useGenerateNextPlotNumberQuery,
  useIncrementPlotCountMutation,
  useDecrementPlotCountMutation,
  useSearchProjectsNearLocationQuery,
  useGetProjectsWithLowAvailabilityQuery,
  useBulkUpdateProjectStatusMutation,
  useGetProjectTimelineQuery,
} = projectApi;
