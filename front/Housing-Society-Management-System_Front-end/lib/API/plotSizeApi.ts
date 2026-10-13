// src/lib/API/plotSizeApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../types/api";
import { PlotSize } from "../types/plotsize";

export const plotSizeApi = createApi({
  reducerPath: "plotSizeApi",
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
  tagTypes: ["PlotSize"],
  endpoints: (builder) => ({
    getPlotSizes: builder.query<PlotSize[], { search?: string }>({
      query: ({ search }) => ({
        url: "/plotsizes",
        params: { search, limit: 50 },
      }),
      transformResponse: (response: ApiResponse<PlotSize[]>) => response.data,
      providesTags: ["PlotSize"],
    }),

    createPlotSize: builder.mutation<PlotSize, { plotSizeName: string }>({
      query: (data) => ({
        url: "/plotsizes",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<PlotSize>) => response.data,
      invalidatesTags: ["PlotSize"],
    }),

    getAllPlotSizes: builder.query<PlotSize[], void>({
      query: () => "/plotsizes/all",
      transformResponse: (response: ApiResponse<PlotSize[]>) => response.data,
    }),
  }),
});

export const {
  useGetPlotSizesQuery,
  useCreatePlotSizeMutation,
  useGetAllPlotSizesQuery,
} = plotSizeApi;
