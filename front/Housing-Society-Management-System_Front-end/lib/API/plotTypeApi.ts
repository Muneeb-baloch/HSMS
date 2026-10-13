// src/lib/API/plotSizeApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../types/api";
import { PlotTypes } from "../types/plottypes";

export const plotTypeApi = createApi({
  reducerPath: "plotTypeApi",
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
  tagTypes: ["PlotType"],
  endpoints: (builder) => ({
    getPlotTypes: builder.query<PlotTypes[], { search?: string }>({
      query: ({ search }) => ({
        url: "/plottypes",
        params: { search, limit: 50 },
      }),
      transformResponse: (response: ApiResponse<PlotTypes[]>) => response.data,
      providesTags: ["PlotType"],
    }),

    createPlotType: builder.mutation<PlotTypes, { plotTypeName: string }>({
      query: (data) => ({
        url: "/plottypes",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<PlotTypes>) => response.data,
      invalidatesTags: ["PlotType"],
    }),

    getAllPlotTypes: builder.query<PlotTypes[], void>({
      query: () => "/plottypes/all",
      transformResponse: (response: ApiResponse<PlotTypes[]>) => response.data,
    }),
  }),
});

export const {
  useGetPlotTypesQuery,
  useCreatePlotTypeMutation,
  useGetAllPlotTypesQuery,
} = plotTypeApi;
