// 'use client'

// import { AppSidebar } from '@/components/app-sidebar'
// import { SiteHeader } from '@/components/site-header'
// import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
// import QueryProvider from '@/lib/providers/QueryProvider'
// import { store } from '@/lib/store/store'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { Provider } from 'react-redux'
// import ProtectedRoute from '../ProtectedRoute'

// export default function ProtectedLayout ({
//   children
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <ProtectedRoute requireAuth>
//       <Provider store={store}>
//         <QueryProvider>
//           <SidebarProvider defaultOpen={true}>
//             <div className='flex min-h-screen'>
//               <AppSidebar variant='inset' />
//               <SidebarInset className='flex flex-col flex-1'>
//                 <SiteHeader />
//                 <div className='flex flex-1 flex-col font-sans overflow-auto scrollbar-hide py-6 px-8'>
//                   {children}
//                 </div>
//               </SidebarInset>
//             </div>
//           </SidebarProvider>
//           <ReactQueryDevtools initialIsOpen={false} />
//         </QueryProvider>
//       </Provider>
//     </ProtectedRoute>
//   )
// }
'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SocketProvider } from '@/lib/providers/SocketProvider'
import 'leaflet/dist/leaflet.css'
import ProtectedRoute from '../ProtectedRoute'

export default function ProtectedLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireAuth>
      <SocketProvider>
        <SidebarProvider defaultOpen={true}>
          <div className='flex h-screen w-full overflow-hidden'>
            <AppSidebar variant='inset' />
            <SidebarInset className='flex min-w-0 flex-1 flex-col overflow-hidden'>
              <SiteHeader />
              <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide bg-background'>
                <div className='container mx-auto py-4 px-3 md:px-6 text-sm'>{children}</div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </SocketProvider>
    </ProtectedRoute>
  )
}
