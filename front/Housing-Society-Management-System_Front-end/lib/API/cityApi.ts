// src/store/api/cityApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../types/api";
import { City } from "../types/entity";

export const cityApi = createApi({
  reducerPath: "cityApi",
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
  tagTypes: ["City"],
  endpoints: (builder) => ({
    getCities: builder.query<City[], { search?: string }>({
      query: ({ search }) => ({
        url: "/cities",
        params: { search, limit: 50 },
      }),
      transformResponse: (response: ApiResponse<City[]>) => response.data,
      providesTags: ["City"],
    }),

    createCity: builder.mutation<City, { cityName: string; country: string }>({
      query: (data) => ({
        url: "/cities",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<City>) => response.data,
      invalidatesTags: ["City"],
    }),
  }),
});

export const { useGetCitiesQuery, useCreateCityMutation } = cityApi;
