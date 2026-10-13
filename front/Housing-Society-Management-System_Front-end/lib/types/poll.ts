// lib/types/poll.ts

export interface PollOption {
  text: string;
  description?: string;
  voteCount: number;
}

export interface Poll {
  _id: string;
  title: string;
  description?: string;
  societyId: string;
  pollType: "survey" | "vote" | "election" | "feedback";
  options: PollOption[];
  isAnonymous: boolean;
  allowMultipleChoices: boolean;
  maxChoices: number;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "closed" | "cancelled";
  totalVoters: number;
  createdAt: string;
  updatedAt: string;
}

export interface PollResults {
  pollId: string;
  title: string;
  totalVoters: number;
  options: { text: string; voteCount: number; percentage: number }[];
}

export interface CreatePollDto {
  title: string;
  description?: string;
  societyId: string;
  pollType: string;
  options: { text: string; description?: string }[];
  isAnonymous?: boolean;
  allowMultipleChoices?: boolean;
  maxChoices?: number;
  startDate: string;
  endDate: string;
}

export interface UpdatePollDto extends Partial<CreatePollDto> {}

export interface PollQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  pollType?: string;
  status?: string;
}

export interface CastVoteDto {
  optionIndices: number[];
}
