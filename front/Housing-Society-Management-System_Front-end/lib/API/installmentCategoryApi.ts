// src/lib/API/installmentCategoryApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../types/api";
import {
  InstallmentCategory,
  InstallmentCategoryOption,
  InstallmentCategoryQueryParams,
  InstallmentCategorySummary,
} from "../types/installmentCategory";

export const installmentCategoryApi = createApi({
  reducerPath: "installmentCategoryApi",
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
  tagTypes: ["InstallmentCategory"],
  endpoints: (builder) => ({
    // Get all categories with pagination
    getCategories: builder.query<
      ApiResponse<{
        categories: InstallmentCategory[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>,
      InstallmentCategoryQueryParams
    >({
      query: (params) => ({
        url: "/installmentcategory",
        params,
      }),
      providesTags: ["InstallmentCategory"],
    }),

    // Get category by ID
    getCategoryById: builder.query<ApiResponse<InstallmentCategory>, string>({
      query: (id) => `/installmentcategory/${id}`,
      providesTags: (result, error, id) => [
        { type: "InstallmentCategory", id },
      ],
    }),

    // Get active categories
    getActiveCategories: builder.query<
      ApiResponse<InstallmentCategory[]>,
      void
    >({
      query: () => "/installmentcategory/active",
      providesTags: ["InstallmentCategory"],
    }),

    // Get mandatory categories
    getMandatoryCategories: builder.query<
      ApiResponse<InstallmentCategory[]>,
      void
    >({
      query: () => "/installmentcategory/mandatory",
      providesTags: ["InstallmentCategory"],
    }),

    // Get category options for dropdown
    getCategoryOptions: builder.query<
      ApiResponse<InstallmentCategoryOption[]>,
      { includeInactive?: boolean }
    >({
      query: (params) => ({
        url: "/installmentcategory/options",
        params,
      }),
      providesTags: ["InstallmentCategory"],
    }),

    // Get statistics
    getCategoryStatistics: builder.query<
      ApiResponse<InstallmentCategorySummary>,
      void
    >({
      query: () => "/installmentcategory/statistics",
    }),

    // Create category
    createCategory: builder.mutation<ApiResponse<InstallmentCategory>, any>({
      query: (data) => ({
        url: "/installmentcategory",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["InstallmentCategory"],
    }),

    // Update category
    updateCategory: builder.mutation<
      ApiResponse<InstallmentCategory>,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/installmentcategory/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["InstallmentCategory"],
    }),

    // Delete category
    deleteCategory: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/installmentcategory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["InstallmentCategory"],
    }),

    // Seed default categories
    seedDefaultCategories: builder.mutation<
      ApiResponse<{ created: number; updated: number; skipped: number }>,
      void
    >({
      query: () => ({
        url: "/installmentcategory/seed-default",
        method: "POST",
      }),
      invalidatesTags: ["InstallmentCategory"],
    }),

    // Validate sequence order
    validateSequenceOrder: builder.query<
      ApiResponse<{ isValid: boolean; message?: string }>,
      { sequenceOrder: number; excludeId?: string }
    >({
      query: (params) => ({
        url: "/installmentcategory/validate-sequence",
        params,
      }),
    }),

    // Reorder categories
    reorderCategories: builder.mutation<
      ApiResponse<{ success: boolean }>,
      { categoryOrders: Array<{ id: string; sequenceOrder: number }> }
    >({
      query: (data) => ({
        url: "/installmentcategory/reorder",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["InstallmentCategory"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetActiveCategoriesQuery,
  useGetMandatoryCategoriesQuery,
  useGetCategoryOptionsQuery,
  useGetCategoryStatisticsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useSeedDefaultCategoriesMutation,
  useValidateSequenceOrderQuery,
  useReorderCategoriesMutation,
} = installmentCategoryApi;
