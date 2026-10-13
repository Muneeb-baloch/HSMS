// src/lib/API/fileApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  CreateFileDto,
  File,
  FileQueryParams,
  FileSummary,
  UpdateFileDto,
} from "../types/file";

export const fileApi = createApi({
  reducerPath: "fileApi",
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
  tagTypes: ["File"],
  endpoints: (builder) => ({
    // Get all files with pagination
    getFiles: builder.query<
      ApiResponse<{
        files: File[];
        pagination: PaginatedResponse<File>["pagination"];
      }>,
      FileQueryParams
    >({
      query: (params) => ({
        url: "/file",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.files.map(({ _id }) => ({
                type: "File" as const,
                id: _id,
              })),
              { type: "File", id: "LIST" },
            ]
          : [{ type: "File", id: "LIST" }],
    }),

    // Get file by ID
    getFileById: builder.query<ApiResponse<File>, string>({
      query: (id) => `/file/${id}`,
      providesTags: (result, error, id) => [{ type: "File", id }],
    }),

    // Get files by member
    getFilesByMember: builder.query<ApiResponse<File[]>, string>({
      query: (memId) => `/file/member/${memId}`,
      providesTags: (result) =>
        result
          ? result.data.map(({ _id }) => ({
              type: "File" as const,
              id: _id,
            }))
          : [],
    }),

    // Get files by project
    getFilesByProject: builder.query<ApiResponse<File[]>, string>({
      query: (projId) => `/file/project/${projId}`,
      providesTags: (result) =>
        result
          ? result.data.map(({ _id }) => ({
              type: "File" as const,
              id: _id,
            }))
          : [],
    }),

    // Get file summary
    getFileSummary: builder.query<ApiResponse<FileSummary>, void>({
      query: () => "/file/dashboard-summary",
    }),

    // Get file statistics
    getFileStatistics: builder.query<ApiResponse<any>, void>({
      query: () => "/file/statistics",
    }),

    // Create file
    createFile: builder.mutation<ApiResponse<File>, CreateFileDto>({
      query: (data) => ({
        url: "/file",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "File", id: "LIST" }],
    }),

    // Update file
    updateFile: builder.mutation<
      ApiResponse<File>,
      { id: string; data: UpdateFileDto }
    >({
      query: ({ id, data }) => ({
        url: `/file/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "File", id },
        { type: "File", id: "LIST" },
      ],
    }),

    // Delete file
    deleteFile: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/file/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "File", id },
        { type: "File", id: "LIST" },
      ],
    }),

    // Search files
    searchFiles: builder.query<
      ApiResponse<File[]>,
      { q: string; limit?: number }
    >({
      query: ({ q, limit = 10 }) => ({
        url: "/file/search",
        params: { q, limit },
      }),
    }),
  }),
});

export const {
  useGetFilesQuery,
  useGetFileByIdQuery,
  useGetFilesByMemberQuery,
  useGetFilesByProjectQuery,
  useGetFileSummaryQuery,
  useGetFileStatisticsQuery,
  useCreateFileMutation,
  useUpdateFileMutation,
  useDeleteFileMutation,
  useLazySearchFilesQuery,
} = fileApi;
