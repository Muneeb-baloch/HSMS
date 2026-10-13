// src/lib/API/plotcategoryApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../types/api";
import {
  BulkPriceCalculationDto,
  CategoryStatistics,
  CreatePlotCategoryDto,
  PlotCategory,
  PlotCategoryQueryParams,
  PriceCalculationDto,
  UpdatePlotCategoryDto,
} from "../types/plotcategory";

export const plotCategoryApi = createApi({
  reducerPath: "plotCategoryApi",
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
  tagTypes: ["PlotCategory"],
  endpoints: (builder) => ({
    getPlotCategories: builder.query<
      ApiResponse<PlotCategoryQueryParams[]>,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
        isActive?: boolean;
        surchargeType?: string;
      }
    >({
      query: (params) => ({
        url: "/plotcategories",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          sortBy: params.sortBy || "categoryName",
          sortOrder: params.sortOrder || "asc",
          isActive: params.isActive,
          surchargeType: params.surchargeType,
        },
      }),
      providesTags: ["PlotCategory"],
    }),

    getPlotCategoryById: builder.query<ApiResponse<PlotCategory>, string>({
      query: (id) => `/plotcategories/${id}`,
      providesTags: (result, error, id) => [{ type: "PlotCategory", id }],
    }),

    getActivePlotCategories: builder.query<ApiResponse<PlotCategory[]>, void>({
      query: () => "/plotcategories/active",
      providesTags: ["PlotCategory"],
    }),

    createPlotCategory: builder.mutation<
      ApiResponse<PlotCategory>,
      CreatePlotCategoryDto
    >({
      query: (data) => ({
        url: "/plotcategories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PlotCategory"],
    }),

    updatePlotCategory: builder.mutation<
      ApiResponse<PlotCategory>,
      { id: string; data: UpdatePlotCategoryDto }
    >({
      query: ({ id, data }) => ({
        url: `/plotcategories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["PlotCategory"],
    }),

    deletePlotCategory: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/plotcategories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PlotCategory"],
    }),

    toggleCategoryStatus: builder.mutation<ApiResponse<PlotCategory>, string>({
      query: (id) => ({
        url: `/plotcategories/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["PlotCategory"],
    }),

    calculatePrice: builder.mutation<
      ApiResponse<PriceCalculationDto>,
      { basePrice: number; categoryId: string }
    >({
      query: (data) => ({
        url: "/plotcategories/calculate/price",
        method: "POST",
        body: data,
      }),
    }),

    calculateBulkPrices: builder.mutation<
      ApiResponse<PriceCalculationDto[]>,
      { basePrice: number; categoryIds: string[] }
    >({
      query: (data) => ({
        url: "/plotcategories/calculate/bulk-prices",
        method: "POST",
        body: data,
      }),
    }),

    getCategoryStatistics: builder.query<ApiResponse<CategoryStatistics>, void>(
      {
        query: () => "/plotcategories/stats/summary",
      },
    ),

    bulkUpdateSurcharge: builder.mutation<
      ApiResponse<BulkPriceCalculationDto>,
      {
        categoryIds: string[];
        surchargePercentage?: number;
        surchargeFixedAmount?: number;
      }
    >({
      query: (data) => ({
        url: "/plotcategories/bulk-update-surcharge",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PlotCategory"],
    }),
  }),
});

export const {
  useGetPlotCategoriesQuery,
  useGetPlotCategoryByIdQuery,
  useGetActivePlotCategoriesQuery,
  useCreatePlotCategoryMutation,
  useUpdatePlotCategoryMutation,
  useDeletePlotCategoryMutation,
  useToggleCategoryStatusMutation,
  useCalculatePriceMutation,
  useCalculateBulkPricesMutation,
  useGetCategoryStatisticsQuery,
  useBulkUpdateSurchargeMutation,
} = plotCategoryApi;
