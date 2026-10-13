// lib/types/forum.ts

export interface ForumThread {
  _id: string;
  title: string;
  content: string;
  societyId: string;
  authorId: string;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  isAnonymous: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt?: string;
  likeCount: number;
  tags: string[];
  status: "active" | "closed" | "hidden" | "flagged";
  createdAt: string;
  updatedAt: string;
}

export interface ForumReply {
  _id: string;
  threadId: string;
  content: string;
  authorId: string;
  isAnonymous: boolean;
  parentReplyId?: string;
  likeCount: number;
  status: "active" | "hidden" | "flagged";
  createdAt: string;
}

export interface CreateThreadDto {
  title: string;
  content: string;
  societyId: string;
  category: string;
  isAnonymous?: boolean;
  tags?: string[];
}

export interface CreateReplyDto {
  content: string;
  isAnonymous?: boolean;
  parentReplyId?: string;
}

export interface ThreadQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  category?: string;
  isPinned?: boolean;
  search?: string;
  sortBy?: "latest" | "popular" | "most-replied";
}

export interface ReplyQueryParams {
  page?: number;
  limit?: number;
}
