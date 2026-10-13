import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../types/api";
import { PlotBlock } from "../types/plotblock";

export const plotBlockApi = createApi({
  reducerPath: "plotBlockApi",
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
  tagTypes: ["PlotBlock"],
  endpoints: (builder) => ({
    getPlotBlocks: builder.query<PlotBlock[], { search?: string }>({
      query: ({ search }) => ({
        url: "/plotblocks",
        params: { search, limit: 50 },
      }),
      transformResponse: (response: ApiResponse<PlotBlock[]>) => response.data,
      providesTags: ["PlotBlock"],
    }),

    createPlotBlock: builder.mutation<
      PlotBlock,
      { plotBlockName: string; plotBlockDesc?: string }
    >({
      query: (data) => ({
        url: "/plotblocks",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<PlotBlock>) => response.data,
      invalidatesTags: ["PlotBlock"],
    }),
  }),
});

export const { useGetPlotBlocksQuery, useCreatePlotBlockMutation } =
  plotBlockApi;
