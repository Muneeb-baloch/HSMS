// lib/hooks/entities/useSuperAdmin.ts
import { apiClient } from '@/lib/API/client'
import { PaginatedResponse } from '@/lib/types/api'
import { Society } from '@/lib/types/society'
import {
  PlatformOverview,
  RevenueReport,
  SocietyListItem,
  SocietyHealth,
  SuperAdminQueryParams,
  CreateSocietyPayload,
  SubscriptionPlan,
  ImpersonatePayload,
  ImpersonateResult,
  GlobalUser,
} from '@/lib/types/superAdmin'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customToast } from '@/lib/utils/customToast'

const QUERY_KEY = 'super-admin'

// ── Platform Stats ──
export const usePlatformOverview = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<PlatformOverview>(
        '/super-admin/stats',
      )
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to fetch platform stats')
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useSocietiesHealth = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'health'],
    queryFn: async () => {
      const response = await apiClient.get<SocietyHealth[]>(
        '/super-admin/health',
      )
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to fetch health data')
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ── Society CRUD ──
export const useSocietyList = (params: SuperAdminQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params)

  return useQuery({
    queryKey: [QUERY_KEY, 'societies', queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, any> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }
      if (params.sortBy) queryParams.sortBy = params.sortBy
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder
      if (params.search) queryParams.search = params.search
      if (params.status) queryParams.status = params.status

      const response = await apiClient.get('/super-admin/societies', {
        params: queryParams,
      })
      if (response.data.success) {
        return {
          items: response.data.data,
          pagination: response.data.pagination,
        }
      }
      throw new Error(response.data.message || 'Failed to fetch societies')
    },
  })
}

export const useSocietyDetail = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'society', id],
    queryFn: async () => {
      const response = await apiClient.get(`/super-admin/societies/${id}`)
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to fetch society')
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateSociety = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateSocietyPayload) => {
      const response = await apiClient.post('/super-admin/societies', payload)
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to create society')
    },
    onSuccess: () => {
      customToast.success('Society created successfully')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to create society')
    },
  })
}

export const useUpdateSociety = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateSocietyPayload>
    }) => {
      const response = await apiClient.patch(
        `/super-admin/societies/${id}`,
        data,
      )
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to update society')
    },
    onSuccess: (_, variables) => {
      customToast.success('Society updated successfully')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, 'society', variables.id],
      })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to update society')
    },
  })
}

export const useSuspendSociety = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/super-admin/societies/${id}`, {
        isActive: false,
        subscriptionStatus: 'suspended',
      })
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to suspend society')
    },
    onSuccess: () => {
      customToast.success('Society suspended successfully')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to suspend society')
    },
  })
}

export const useActivateSociety = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/super-admin/societies/${id}`, {
        isActive: true,
        subscriptionStatus: 'active',
      })
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to activate society')
    },
    onSuccess: () => {
      customToast.success('Society activated successfully')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to activate society')
    },
  })
}

// ── Global Users ──
export const useGlobalUsers = (params: SuperAdminQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'users', JSON.stringify(params)],
    queryFn: async () => {
      const response = await apiClient.get('/super-admin/users', {
        params,
      })
      if (response.data.success) {
        return { items: response.data.data, pagination: response.data.pagination }
      }
      throw new Error(response.data.message || 'Failed to fetch users')
    },
  })
}

// ── Impersonation ──
export const useImpersonate = () => {
  return useMutation({
    mutationFn: async (payload: ImpersonatePayload): Promise<ImpersonateResult> => {
      const response = await apiClient.post('/super-admin/impersonate', payload)
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to impersonate user')
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Impersonation failed')
    },
  })
}

// ── Subscription Plans ──
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'plans'],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionPlan[]>(
        '/super-admin/plans',
      )
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to fetch plans')
    },
    staleTime: 10 * 60 * 1000,
  })
}

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Omit<SubscriptionPlan, '_id' | 'isActive' | 'sortOrder'>) => {
      const response = await apiClient.post('/super-admin/plans', payload)
      if (response.data.success) return response.data.data
      throw new Error(response.data.message || 'Failed to create plan')
    },
    onSuccess: () => {
      customToast.success('Plan created successfully')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'plans'] })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to create plan')
    },
  })
}

// ── Audit Logs ──
export const useGlobalAuditLogs = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'audit-logs', JSON.stringify(params)],
    queryFn: async () => {
      const response = await apiClient.get('/super-admin/audit-logs', {
        params,
      })
      if (response.data.success) {
        return { items: response.data.data, pagination: response.data.pagination }
      }
      throw new Error(response.data.message || 'Failed to fetch audit logs')
    },
  })
}

// ── Revenue (kept for backwards compat) ──
export const useRevenueReport = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'revenue'],
    queryFn: async () => {
      // Revenue data is now part of platform stats
      const response = await apiClient.get<PlatformOverview>('/super-admin/stats')
      if (response.data.success) {
        const stats = response.data.data
        return {
          totalRevenue: stats.mrr * 12,
          monthlyRevenue: {},
          revenueByPlan: {},
        } as RevenueReport
      }
      throw new Error(response.data.message || 'Failed to fetch revenue')
    },
    staleTime: 5 * 60 * 1000,
  })
}
