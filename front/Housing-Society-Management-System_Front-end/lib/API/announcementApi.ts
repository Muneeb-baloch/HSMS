import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Announcement,
  AnnouncementQueryParams,
  CreateAnnouncementDto,
  PublishAnnouncementDto,
  UpdateAnnouncementDto,
} from "../types/announcement";
import { ApiResponse } from "../types/api";

export const announcementApi = createApi({
  reducerPath: "announcementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Announcement"],
  endpoints: (builder) => ({
    getAnnouncements: builder.query<any, AnnouncementQueryParams>({
      query: (params) => ({ url: "/announcement", params }),
      providesTags: (result) =>
        result?.data?.announcements
          ? [
              ...result.data.announcements.map(({ _id }: any) => ({
                type: "Announcement" as const,
                id: _id,
              })),
              { type: "Announcement", id: "LIST" },
            ]
          : [{ type: "Announcement", id: "LIST" }],
    }),

    getAnnouncementById: builder.query<Announcement, string>({
      query: (id) => `/announcement/${id}`,
      transformResponse: (response: ApiResponse<Announcement>) => response.data,
      providesTags: (_, __, id) => [{ type: "Announcement", id }],
    }),

    createAnnouncement: builder.mutation<
      ApiResponse<Announcement>,
      CreateAnnouncementDto
    >({
      query: (body) => ({
        url: "/announcement",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Announcement", id: "LIST" }],
    }),

    updateAnnouncement: builder.mutation<
      ApiResponse<Announcement>,
      { id: string; data: UpdateAnnouncementDto }
    >({
      query: ({ id, data }) => ({
        url: `/announcement/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Announcement", id },
        { type: "Announcement", id: "LIST" },
      ],
    }),

    deleteAnnouncement: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/announcement/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Announcement", id },
        { type: "Announcement", id: "LIST" },
      ],
    }),

    publishAnnouncement: builder.mutation<
      ApiResponse<Announcement>,
      { id: string; data: PublishAnnouncementDto }
    >({
      query: ({ id, data }) => ({
        url: `/announcement/${id}/publish`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Announcement", id },
        { type: "Announcement", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  usePublishAnnouncementMutation,
} = announcementApi;
