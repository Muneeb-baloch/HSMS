// src/lib/API/announcementCategoryApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AnnouncementCategory,
  AnnouncementCategoryQueryParams,
  AnnouncementCategoryStatistics,
  CreateAnnouncementCategoryDto,
  GetAnnouncementCategoriesResult,
  UpdateAnnouncementCategoryDto,
} from "../types/announcementCategory";
import { ApiResponse } from "../types/api";

export const announcementCategoryApi = createApi({
  reducerPath: "announcementCategoryApi",
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
  tagTypes: ["AnnouncementCategory"],
  endpoints: (builder) => ({
    // ───────────────────────────────────────────────
    //  Get all categories (paginated + filters)
    // ───────────────────────────────────────────────
    getAnnouncementCategories: builder.query<
      ApiResponse<GetAnnouncementCategoriesResult>,
      AnnouncementCategoryQueryParams
    >({
      query: (params) => ({
        url: "/announcementcategory",
        params,
      }),
      providesTags: (result) =>
        result?.data?.announcementCategories
          ? [
              ...result.data.announcementCategories.map(({ _id }) => ({
                type: "AnnouncementCategory" as const,
                id: _id,
              })),
              { type: "AnnouncementCategory", id: "LIST" },
            ]
          : [{ type: "AnnouncementCategory", id: "LIST" }],
    }),

    // ───────────────────────────────────────────────
    //  Get single category by ID
    // ───────────────────────────────────────────────
    getAnnouncementCategoryById: builder.query<
      ApiResponse<AnnouncementCategory>,
      string
    >({
      query: (id) => `/announcementcategory/${id}`,
      providesTags: (result, error, id) => [
        { type: "AnnouncementCategory", id },
      ],
    }),

    // ───────────────────────────────────────────────
    //  Get category statistics
    // ───────────────────────────────────────────────
    getAnnouncementCategoryStatistics: builder.query<
      ApiResponse<AnnouncementCategoryStatistics>,
      void
    >({
      query: () => "/announcementcategory/statistics",
      providesTags: ["AnnouncementCategory"],
    }),

    // ───────────────────────────────────────────────
    //  Create new category
    // ───────────────────────────────────────────────
    createAnnouncementCategory: builder.mutation<
      ApiResponse<AnnouncementCategory>,
      CreateAnnouncementCategoryDto
    >({
      query: (data) => ({
        url: "/announcementcategory",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "AnnouncementCategory", id: "LIST" }],
    }),

    // ───────────────────────────────────────────────
    //  Update category
    // ───────────────────────────────────────────────
    updateAnnouncementCategory: builder.mutation<
      ApiResponse<AnnouncementCategory>,
      { id: string; data: UpdateAnnouncementCategoryDto }
    >({
      query: ({ id, data }) => ({
        url: `/announcementcategory/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AnnouncementCategory", id },
        { type: "AnnouncementCategory", id: "LIST" },
      ],
    }),

    // ───────────────────────────────────────────────
    //  Delete category (soft delete)
    // ───────────────────────────────────────────────
    deleteAnnouncementCategory: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/announcementcategory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "AnnouncementCategory", id },
        { type: "AnnouncementCategory", id: "LIST" },
      ],
    }),

    // ───────────────────────────────────────────────
    //  Toggle active/inactive status
    // ───────────────────────────────────────────────
    toggleCategoryStatus: builder.mutation<
      ApiResponse<AnnouncementCategory>,
      string
    >({
      query: (id) => ({
        url: `/announcementcategory/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "AnnouncementCategory", id },
        { type: "AnnouncementCategory", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAnnouncementCategoriesQuery,
  useGetAnnouncementCategoryByIdQuery,
  useGetAnnouncementCategoryStatisticsQuery,
  useCreateAnnouncementCategoryMutation,
  useUpdateAnnouncementCategoryMutation,
  useDeleteAnnouncementCategoryMutation,
  useToggleCategoryStatusMutation,

  // Lazy versions if needed
  useLazyGetAnnouncementCategoriesQuery,
  useLazyGetAnnouncementCategoryByIdQuery,
} = announcementCategoryApi;
