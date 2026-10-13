'use client'

import { ConfirmDialogProvider } from '@/components/shared/ConfirmDialog'
import { store } from '@/lib/store/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { Provider } from 'react-redux'

export function Providers ({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  )

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfirmDialogProvider>
          {children}
        </ConfirmDialogProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  )
}
