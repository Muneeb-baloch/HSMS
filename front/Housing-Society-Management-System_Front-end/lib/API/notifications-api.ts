import { apiClient } from './client'

export interface NotificationItem {
  _id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  readAt?: string
  data?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface NotificationsResponse {
  success: boolean
  data: NotificationItem[]
  pagination: { page: number; limit: number; total: number; pages: number }
  unreadCount: number
}

export const notificationsApi = {
  getList: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    apiClient.get<NotificationsResponse>('/notifications', { params }),

  getUnreadCount: () =>
    apiClient.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.patch<{ success: boolean; data: NotificationItem }>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch<{ success: boolean; message: string }>('/notifications/read-all'),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/notifications/${id}`),
}
