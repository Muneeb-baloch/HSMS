// lib/API/meetingApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  Meeting,
  CreateMeetingDto,
  UpdateMeetingDto,
  MeetingQueryParams,
  AgendaItem,
  MeetingDecision,
} from "@/lib/types/meeting";

const BASE = "/meetings";

export const meetingApi = {
  getAll: (params: MeetingQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.societyId) queryParams.societyId = params.societyId;
    if (params.meetingType) queryParams.meetingType = params.meetingType;
    if (params.status) queryParams.status = params.status;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return apiClient.get<{
      items: Meeting[];
      pagination: PaginatedResponse<Meeting>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getById: (id: string) => apiClient.get<Meeting>(`${BASE}/${id}`),

  create: (data: CreateMeetingDto) =>
    apiClient.post<Meeting>(BASE, data),

  update: (id: string, data: UpdateMeetingDto) =>
    apiClient.put<Meeting>(`${BASE}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}`),

  addAgendaItem: (id: string, item: AgendaItem) =>
    apiClient.post<Meeting>(`${BASE}/${id}/agenda`, item),

  updateMinutes: (id: string, minutes: string) =>
    apiClient.patch<Meeting>(`${BASE}/${id}/minutes`, { minutes }),

  recordAttendance: (id: string, memberId: string, status: string) =>
    apiClient.patch<Meeting>(`${BASE}/${id}/attendance`, {
      memberId,
      status,
    }),

  addDecision: (id: string, decision: MeetingDecision) =>
    apiClient.post<Meeting>(`${BASE}/${id}/decisions`, decision),

  completeMeeting: (id: string) =>
    apiClient.patch<Meeting>(`${BASE}/${id}/complete`, {}),
};
