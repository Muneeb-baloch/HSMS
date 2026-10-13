import { apiClient } from '@/lib/API/client'
import {
  CreateLookupValueDto,
  LookupCategory,
  LookupQueryParams,
  LookupValue,
  UpdateLookupValueDto,
} from '@/lib/types/lookup'
import { PaginatedResponse } from '@/lib/types/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customToast } from '@/lib/utils/customToast'

const QUERY_KEY = 'lookups'

export const useLookupValues = (params: LookupQueryParams = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<{
        lookupValues: LookupValue[]
        pagination: PaginatedResponse<LookupValue>['pagination']
      }>('/lookups', { params })

      if (response.data.success) {
        return {
          items: response.data.data.lookupValues,
          pagination: response.data.data.pagination,
        }
      }
      throw new Error(response.data.message || 'Failed to fetch lookup values')
    },
    staleTime: 10 * 60 * 1000, // Lookups change rarely - cache for 10 min
  })
}

export const useLookupByCategory = (category: LookupCategory) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'category', category],
    queryFn: async () => {
      const response = await apiClient.get<LookupValue[]>(
        `/lookups/category/${category}`
      )

      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch lookup values')
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!category,
  })
}

export const useLookupValue = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<LookupValue>(`/lookups/${id}`)

      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch lookup value')
    },
    enabled: !!id,
  })
}

export const useCreateLookupValue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateLookupValueDto): Promise<LookupValue> => {
      const response = await apiClient.post<LookupValue>('/lookups', data)

      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to create lookup value')
    },
    onSuccess: () => {
      customToast.success('Lookup value created successfully')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to create lookup value')
    },
  })
}

export const useUpdateLookupValue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateLookupValueDto
    }): Promise<LookupValue> => {
      const response = await apiClient.put<LookupValue>(`/lookups/${id}`, data)

      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to update lookup value')
    },
    onSuccess: (_, variables) => {
      customToast.success('Lookup value updated successfully')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to update lookup value')
    },
  })
}

export const useDeleteLookupValue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/lookups/${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete lookup value')
      }
    },
    onSuccess: () => {
      customToast.success('Lookup value deleted successfully')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to delete lookup value')
    },
  })
}

export const useReorderLookupValues = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      items: { id: string; sequence: number }[]
    ): Promise<void> => {
      const response = await apiClient.post('/lookups/reorder', { items })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reorder lookup values')
      }
    },
    onSuccess: () => {
      customToast.success('Lookup values reordered successfully')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to reorder lookup values')
    },
  })
}

export const useSeedLookupValues = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<{ created: number; skipped: number }> => {
      const response = await apiClient.post<{ created: number; skipped: number }>(
        '/lookups/seed'
      )

      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to seed lookup values')
    },
    onSuccess: (data) => {
      customToast.success(
        `Seed complete: ${data.created} created, ${data.skipped} skipped`
      )
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error: Error) => {
      customToast.error(error.message || 'Failed to seed lookup values')
    },
  })
}
