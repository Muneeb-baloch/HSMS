// src/store/api/memberApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  Member,
  MemberQueryParams,
  CreateMemberDto,
  UpdateMemberDto,
} from "../types/entity";

export const memberApi = createApi({
  reducerPath: "memberApi",
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
  tagTypes: ["Member"],
  endpoints: (builder) => ({
    // Get paginated members
    getMembers: builder.query<PaginatedResponse<Member>, MemberQueryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
        return `/members?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ _id }) => ({
                type: "Member" as const,
                id: _id as string,
              })),
              { type: "Member", id: "LIST" },
            ]
          : [{ type: "Member", id: "LIST" }],
      transformResponse: (
        response: ApiResponse<{
          members: Member[];
          pagination: PaginatedResponse<Member>["pagination"];
        }>
      ) => ({
        items: response.data.members,
        pagination: response.data.pagination,
      }),
    }),

    // Get single member
    getMemberById: builder.query<Member, string>({
      query: (id) => `/members/${id}`,
      transformResponse: (response: ApiResponse<Member>) => response.data,
      providesTags: (result, error, id) => [{ type: "Member", id }],
    }),

    // Create member
    createMember: builder.mutation<Member, CreateMemberDto>({
      query: (data) => ({
        url: "/members",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Member>) => response.data,
      invalidatesTags: [{ type: "Member", id: "LIST" }],
    }),

    // Update member
    updateMember: builder.mutation<
      Member,
      { id: string; data: UpdateMemberDto }
    >({
      query: ({ id, data }) => ({
        url: `/members/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Member>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Member", id },
        { type: "Member", id: "LIST" },
      ],
    }),

    // Delete member
    deleteMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `/members/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Member", id },
        { type: "Member", id: "LIST" },
      ],
    }),

    // Search members
    searchMembers: builder.query<Member[], string>({
      query: (query) => `/members/search?query=${encodeURIComponent(query)}`,
      transformResponse: (response: ApiResponse<Member[]>) => response.data,
    }),
  }),
});

export const {
  useGetMembersQuery,
  useLazyGetMembersQuery,
  useGetMemberByIdQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useSearchMembersQuery,
} = memberApi;
