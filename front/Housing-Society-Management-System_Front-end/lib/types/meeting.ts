// lib/types/meeting.ts

export interface AgendaItem {
  title: string;
  description?: string;
  presenter?: string;
  duration?: number;
}

export interface MeetingDecision {
  description: string;
  decidedBy?: string;
  votesFor?: number;
  votesAgainst?: number;
  abstained?: number;
}

export interface MeetingAttendee {
  memberId: string;
  status: "invited" | "confirmed" | "attended" | "absent" | "proxy";
  proxyTo?: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  societyId: string;
  meetingType:
    | "agm"
    | "special"
    | "committee"
    | "emergency"
    | "general";
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  isOnline: boolean;
  onlineLink?: string;
  agenda: AgendaItem[];
  minutes?: string;
  decisions: MeetingDecision[];
  attendees: MeetingAttendee[];
  quorumRequired?: number;
  quorumMet: boolean;
  status:
    | "draft"
    | "scheduled"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "adjourned";
  attachments: { name: string; fileUrl: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingDto {
  title: string;
  description?: string;
  societyId: string;
  meetingType: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  isOnline?: boolean;
  onlineLink?: string;
  quorumRequired?: number;
}

export interface UpdateMeetingDto extends Partial<CreateMeetingDto> {}

export interface MeetingQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  meetingType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}
