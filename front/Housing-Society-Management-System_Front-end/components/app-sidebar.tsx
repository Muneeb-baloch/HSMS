// 'use client'

// import { NavUser } from '@/components/nav-user'
// import { Separator } from '@/components/ui/separator'
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider
// } from '@/components/ui/sidebar'
// import { UserRole } from '@/lib/constants/roles'
// import { getSidebarConfig } from '@/lib/constants/sidebar.constants'
// import { useAuth } from '@/lib/hooks/useAuth'
// import { cn } from '@/lib/utils'
// import {
//   IconBuildingCommunity,
//   IconChevronDown,
//   IconChevronRight,
//   IconHomeInfinity
// } from '@tabler/icons-react'
// import { AnimatePresence, motion } from 'framer-motion'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import React, { useMemo, useState } from 'react'

// export function AppSidebar ({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   const pathname = usePathname()
//   const { user } = useAuth()
//   const [userToggles, setUserToggles] = useState<Record<string, boolean>>({})

//   const sidebarConfig = useMemo(() => {
//     if (!user) return null

//     const userRole = (user.role as UserRole) || UserRole.USER
//     const config = getSidebarConfig(userRole)

//     config.user = {
//       name:
//         `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
//         user.email?.split('@')[0] ||
//         'User',
//       email: user.email || 'user@example.com',
//       avatar: user.avatar || '',
//       role: userRole
//     }

//     return config
//   }, [user])

//   const computeActiveOpen = useMemo(() => {
//     if (!sidebarConfig) return {}

//     const result: Record<string, boolean> = {}
//     sidebarConfig.sections.forEach(section => {
//       const hasActiveItem = section.items.some(item => {
//         if (item.isDivider || item.sectionTitle) return false
//         return pathname === item.url || pathname.startsWith(`${item.url}/`)
//       })
//       if (hasActiveItem) {
//         result[section.id] = true
//       }
//     })
//     return result
//   }, [pathname, sidebarConfig])

//   const openSections = {
//     ...computeActiveOpen,
//     ...userToggles
//   }

//   const toggleSection = (sectionId: string) => {
//     setUserToggles(prev => ({
//       ...prev,
//       [sectionId]: !prev[sectionId]
//     }))
//   }

//   if (!sidebarConfig) {
//     return (
//       <Sidebar collapsible='offcanvas' {...props}>
//         <SidebarHeader className='border-b border-sidebar-border/50'>
//           <SidebarMenu>
//             <SidebarMenuItem>
//               <SidebarMenuButton
//                 asChild
//                 className='data-[slot=sidebar-menu-button]:!p-1.5 hover:scale-[1.02] transition-transform duration-200'
//               >
//                 <Link href='/dashboard' onClick={closeMobileSidebar} className='group'>
//                   <div className='relative'>
//                     <IconHomeInfinity className='!size-6 text-primary-500 transition-transform duration-300 group-hover:scale-110' />
//                     <div className='absolute -inset-1 bg-primary-500/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
//                   </div>
//                   <motion.span
//                     initial={{ opacity: 0, x: -5 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     className='text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent'
//                   >
//                     HSMS
//                   </motion.span>
//                 </Link>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           </SidebarMenu>
//         </SidebarHeader>
//         <SidebarContent className='flex items-center justify-center'>
//           <div className='flex flex-col items-center gap-3 p-8'>
//             <div className='relative'>
//               <div className='w-12 h-12 border-3 border-primary-500/30 rounded-full animate-spin' />
//               <div className='absolute inset-0 flex items-center justify-center'>
//                 <div className='w-6 h-6 bg-primary-500 rounded-full animate-pulse' />
//               </div>
//             </div>
//             <p className='text-sidebar-foreground/60 text-sm font-medium'>
//               Loading navigation...
//             </p>
//           </div>
//         </SidebarContent>
//       </Sidebar>
//     )
//   }

//   return (
//     <SidebarProvider>
//       <Sidebar
//         collapsible='offcanvas'
//         {...props}
//         className='border-r border-sidebar-border/50 bg-gradient-to-b from-sidebar to-sidebar/95 backdrop-blur-sm'
//       >
//         <SidebarHeader className='px-3 py-2 border-b border-sidebar-border/30 '>
//           <SidebarMenu>
//             <SidebarMenuItem>
//               <SidebarMenuButton
//                 asChild
//                 className='data-[slot=sidebar-menu-button]:!p-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
//               >
//                 <Link href='/dashboard' onClick={closeMobileSidebar} className='group w-full max-w-full'>
//                   <div className='relative'>
//                     <div className='absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
//                     <IconHomeInfinity className='relative size-6 text-primary-500 group-hover:text-primary-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3' />
//                   </div>
//                   <motion.span
//                     initial={{ opacity: 0, x: -5 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.1 }}
//                     className='text-lg font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text my-3 tracking-tight'
//                   >
//                     HSMS Pro
//                   </motion.span>
//                 </Link>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           </SidebarMenu>
//         </SidebarHeader>

//         <SidebarContent className='overflow-y-auto overflow-x-hidden scrollbar-hide pb-20 '>
//           <div className='w-full max-w-full px-2 py-3'>
//             <div className='w-full max-w-full'>
//               <div className='bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-lg p-2 backdrop-blur-sm border border-primary-500/20 w-full'>
//                 <div className='flex items-center gap-2 mb-2'>
//                   <div className='p-1.5 bg-primary-500/20 rounded-lg'>
//                     <IconBuildingCommunity className='size-4 text-primary-500' />
//                   </div>
//                   <div className='min-w-0'>
//                     <h3 className='text-sm font-semibold text-sidebar-foreground truncate'>
//                       Quick Actions
//                     </h3>
//                     <p className='text-xs text-sidebar-foreground/60 truncate'>
//                       Most used tools
//                     </p>
//                   </div>
//                 </div>
//                 <div className='grid grid-cols-2 gap-2'>
//                   <button className='p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group w-full'>
//                     <span className='text-xs font-medium text-sidebar-foreground group-hover:text-primary-400 truncate block'>
//                       New Plot
//                     </span>
//                   </button>
//                   <button className='p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group w-full'>
//                     <span className='text-xs font-medium text-sidebar-foreground group-hover:text-secondary-400 truncate block'>
//                       Add Member
//                     </span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className='w-full max-w-full px-2 space-y-0.5'>
//             {sidebarConfig.sections.map((section, sectionIndex) => (
//               <React.Fragment key={section.id}>
//                 {section.items.length > 0 && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: sectionIndex * 0.1 }}
//                     className='w-full max-w-full'
//                   >
//                     <button
//                       onClick={() => toggleSection(section.id)}
//                       className='w-full max-w-full flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent/30 transition-all duration-200 group'
//                     >
//                       <div className='flex items-center gap-3 min-w-0'>
//                         <div
//                           className={cn(
//                             'p-1.5 rounded-lg transition-all duration-300 flex-shrink-0',
//                             openSections[section.id]
//                               ? 'bg-primary-500/20 rotate-180'
//                               : 'bg-white/5 group-hover:bg-white/10'
//                           )}
//                         >
//                           <IconChevronDown
//                             className={cn(
//                               'size-3.5 transition-all duration-300',
//                               openSections[section.id]
//                                 ? 'text-primary-400'
//                                 : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80'
//                             )}
//                           />
//                         </div>
//                         <span className='text-sm font-semibold text-sidebar-foreground/80 uppercase tracking-wider truncate'>
//                           {section.id.replace('-', ' ')}
//                         </span>
//                       </div>
//                       <div className='text-xs text-sidebar-foreground/40 font-mono flex-shrink-0 ml-2'>
//                         {
//                           section.items.filter(
//                             item => !item.isDivider && !item.sectionTitle
//                           ).length
//                         }
//                       </div>
//                     </button>

//                     <AnimatePresence>
//                       {openSections[section.id] && (
//                         <motion.div
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: 'auto' }}
//                           exit={{ opacity: 0, height: 0 }}
//                           transition={{ duration: 0.2 }}
//                           className='overflow-hidden w-full max-w-full'
//                         >
//                           <div className='ml-2 pl-2 border-l border-sidebar-border/30 space-y-0.5 pb-1.5 w-full max-w-full'>
//                             {section.items
//                               .filter(
//                                 item => !item.isDivider && !item.sectionTitle
//                               )
//                               .map((item, itemIndex) => {
//                                 const isActive =
//                                   pathname === item.url ||
//                                   pathname.startsWith(`${item.url}/`)

//                                 return (
//                                   <motion.div
//                                     key={item.id}
//                                     initial={{ opacity: 0, x: -10 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ delay: itemIndex * 0.05 }}
//                                     className='w-full max-w-full'
//                                   >
//                                     <Link
//                                       href={item.url}
//                                       className={cn(
//                                         'flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 group/item w-full max-w-full',
//                                         isActive
//                                           ? 'bg-gradient-to-r from-primary-500/20 to-primary-500/10 border-l-2 border-primary-500'
//                                           : 'hover:bg-sidebar-accent/20 hover:translate-x-1'
//                                       )}
//                                     >
//                                       {isActive && (
//                                         <motion.div
//                                           layoutId='activeIndicator'
//                                           className='absolute left-0 w-1 h-6 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-r-full'
//                                         />
//                                       )}

//                                       <div
//                                         className={cn(
//                                           'p-1.5 rounded-md transition-all duration-300 relative flex-shrink-0',
//                                           isActive
//                                             ? 'bg-primary-500/20 text-primary-400'
//                                             : 'bg-white/5 text-sidebar-foreground/60 group-hover/item:bg-white/10 group-hover/item:text-sidebar-foreground/80'
//                                         )}
//                                       >
//                                         <item.icon className='size-4' />
//                                         {isActive && (
//                                           <div className='absolute inset-0 bg-primary-500/20 rounded-md animate-ping opacity-20' />
//                                         )}
//                                       </div>

//                                       <span
//                                         className={cn(
//                                           'text-sm font-medium transition-colors duration-200 truncate flex-1 min-w-0',
//                                           isActive
//                                             ? 'text-sidebar-foreground'
//                                             : 'text-sidebar-foreground/80 group-hover/item:text-sidebar-foreground'
//                                         )}
//                                       >
//                                         {item.title}
//                                       </span>

//                                       {item.badge && (
//                                         <span className='ml-auto text-xs px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded-md flex-shrink-0'>
//                                           {item.badge}
//                                         </span>
//                                       )}

//                                       <IconChevronRight className='size-3.5 text-sidebar-foreground/40 opacity-0 group-hover/item:opacity-100 transition-all duration-200 ml-1 flex-shrink-0' />
//                                     </Link>
//                                   </motion.div>
//                                 )
//                               })}
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </motion.div>
//                 )}

//                 {sectionIndex < sidebarConfig.sections.length - 1 && (
//                   <Separator className='my-2 bg-gradient-to-r from-transparent via-sidebar-border/30 to-transparent h-px w-full' />
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         </SidebarContent>

//         <SidebarFooter className='border-t border-sidebar-border/30 bg-sidebar/95 backdrop-blur-lg'>
//           <div className='px-2 py-3 w-full'>
//             <div className='relative w-full'>
//               <div className='absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
//               <NavUser />
//               <div className='absolute right-3 bottom-3'>
//                 <div className='relative'>
//                   <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
//                   <div className='absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping' />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </SidebarFooter>
//       </Sidebar>
//     </SidebarProvider>
//   )
// }
'use client'

import { NavUser } from '@/components/nav-user'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { UserRole } from '@/lib/constants/roles'
import { getSidebarConfig } from '@/lib/constants/sidebar.constants'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  IconBuildingCommunity,
  IconChevronDown,
  IconChevronRight,
  IconHomeInfinity,
  IconMapPin,
  IconUserPlus
} from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useMemo, useState } from 'react'

export function AppSidebar ({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()
  const [userToggles, setUserToggles] = useState<Record<string, boolean>>({})

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false)
  }

  const sidebarConfig = useMemo(() => {
    if (!user) return null

    const userRole = (user.role as UserRole) || UserRole.USER
    const config = getSidebarConfig(userRole)

    config.user = {
      name:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email?.split('@')[0] ||
        'User',
      email: user.email || 'user@example.com',
      avatar: user.avatar || '',
      role: userRole
    }

    return config
  }, [user])

  const computeActiveOpen = useMemo(() => {
    if (!sidebarConfig) return {}

    const result: Record<string, boolean> = {}
    sidebarConfig.sections.forEach(section => {
      const hasActiveItem = section.items.some(item => {
        if (item.isDivider || item.sectionTitle) return false
        return pathname === item.url || pathname.startsWith(`${item.url}/`)
      })
      if (hasActiveItem) {
        result[section.id] = true
      }
    })
    return result
  }, [pathname, sidebarConfig])

  const openSections = {
    ...computeActiveOpen,
    ...userToggles
  }

  const toggleSection = (sectionId: string) => {
    setUserToggles(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  if (!sidebarConfig) {
    return (
      <Sidebar collapsible='offcanvas' {...props}>
        <SidebarHeader className='border-b border-sidebar-border/50'>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className='data-[slot=sidebar-menu-button]:!p-1.5 hover:scale-[1.02] transition-transform duration-200'
              >
                <Link
                  href='/dashboard'
                  onClick={closeMobileSidebar}
                  className='group'
                >
                  <div className='relative'>
                    <IconHomeInfinity
                      height={10}
                      width={10}
                      className='h-6 w-6
                      text-primary-500 transition-transform duration-300 group-hover:scale-100'
                    />
                    <div className='absolute -inset-1 bg-primary-500/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                  </div>
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='text-sm font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent group-data-[collapsible=icon]:hidden'
                  >
                    HSMS
                  </motion.span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className='flex items-center justify-center'>
          <div className='flex flex-col items-center gap-3 p-8'>
            <div className='relative'>
              <div className='w-12 h-12 border-3 border-primary-500/30 rounded-full animate-spin' />
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-6 h-6 bg-primary-500 rounded-full animate-pulse' />
              </div>
            </div>
            <p className='text-sidebar-foreground/60 text-xs font-medium'>
              Loading navigation...
            </p>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    // SidebarProvider remove kar diya - layout.tsx mein already hai
    <Sidebar
      collapsible='offcanvas'
      {...props}
      className='border-r border-sidebar-border/50 bg-gradient-to-b from-sidebar to-sidebar/95 backdrop-blur-sm'
    >
      <SidebarHeader className='px-3 py-2 border-b border-sidebar-border/30 '>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
            >
              <Link
                href='/dashboard'
                onClick={closeMobileSidebar}
                className='group w-full max-w-full'
              >
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
                  <IconHomeInfinity className='relative size-6 text-primary-500 group-hover:text-primary-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3' />
                </div>
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className='text-base font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text my-2 tracking-tight group-data-[collapsible=icon]:hidden'
                >
                  HSMS
                </motion.span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='overflow-y-auto overflow-x-hidden scrollbar-hide pb-20 '>
        <div className='w-full max-w-full px-2 py-3'>
          <div className='w-full max-w-full'>
            <div className='bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-lg p-2 backdrop-blur-sm border border-primary-500/20 w-full'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-1.5 bg-primary-500/20 rounded-lg'>
                  <IconBuildingCommunity className='size-4 text-primary-500' />
                </div>
                <div className='min-w-0'>
                  <h3 className='text-xs font-semibold text-sidebar-foreground truncate'>
                    Quick Actions
                  </h3>
                  <p className='text-[10px] text-sidebar-foreground/60 truncate'>
                    Most used tools
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-2  gap-1.5'>
                <button className='flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group w-full'>
                  <Link href='/plots/create'>
                    <IconMapPin className='size-4 text-primary-400 group-hover:text-primary-300' />
                    <span className='text-[10px] font-medium text-sidebar-foreground group-hover:text-primary-400 truncate block'>
                      New Plot
                    </span>
                  </Link>
                </button>
                <button className='flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group w-full'>
                  <Link href='/members/create'>
                    <IconUserPlus className='size-4 text-secondary-400 group-hover:text-secondary-300' />
                    <span className='text-[10px] font-medium text-sidebar-foreground group-hover:text-secondary-400 truncate block'>
                      Add Member
                    </span>
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full max-w-full px-2 space-y-0.5'>
          {sidebarConfig.sections.map((section, sectionIndex) => (
            <React.Fragment key={section.id}>
              {section.items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className='w-full max-w-full'
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className='w-full max-w-full flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-accent/30 transition-all duration-200 group'
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <div
                        className={cn(
                          'p-1.5 rounded-lg transition-all duration-300 flex-shrink-0',
                          openSections[section.id]
                            ? 'bg-primary-500/20 rotate-180'
                            : 'bg-white/5 group-hover:bg-white/10'
                        )}
                      >
                        <IconChevronDown
                          className={cn(
                            'size-3.5 transition-all duration-300',
                            openSections[section.id]
                              ? 'text-primary-400'
                              : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80'
                          )}
                        />
                      </div>
                      <span className='text-xs font-semibold text-sidebar-foreground/80 uppercase tracking-wider truncate group-data-[collapsible=icon]:hidden'>
                        {section.title || section.id.replace('-', ' ')}
                      </span>
                    </div>
                    <div className='text-[10px] text-sidebar-foreground/40 font-mono shrink-0 ml-2 group-data-[collapsible=icon]:hidden'>
                      {
                        section.items.filter(
                          item => !item.isDivider && !item.sectionTitle
                        ).length
                      }
                    </div>
                  </button>

                  <AnimatePresence>
                    {openSections[section.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className='overflow-hidden w-full max-w-full'
                      >
                        <div className='ml-2 pl-2 border-l border-sidebar-border/30 space-y-0.5 pb-1.5 w-full max-w-full'>
                          {section.items
                            .filter(
                              item => !item.isDivider && !item.sectionTitle
                            )
                            .map((item, itemIndex) => {
                              const isActive =
                                pathname === item.url ||
                                pathname.startsWith(`${item.url}/`)

                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: itemIndex * 0.05 }}
                                  className='w-full max-w-full'
                                >
                                  <Link
                                    href={item.url}
                                    onClick={closeMobileSidebar}
                                    className={cn(
                                      'flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 group/item w-full max-w-full',
                                      isActive
                                        ? 'bg-gradient-to-r from-primary-500/20 to-primary-500/10 border-l-2 border-primary-500'
                                        : 'hover:bg-sidebar-accent/20 hover:translate-x-1'
                                    )}
                                  >
                                    {isActive && (
                                      <motion.div
                                        layoutId='activeIndicator'
                                        className='absolute left-0 w-1 h-6 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-r-full'
                                      />
                                    )}

                                    <div
                                      className={cn(
                                        'p-1.5 rounded-md transition-all duration-300 relative flex-shrink-0',
                                        isActive
                                          ? 'bg-primary-500/20 text-primary-400'
                                          : 'bg-white/5 group-hover/item:bg-white/10',
                                        !isActive &&
                                          [
                                            'text-blue-400',
                                            'text-emerald-400',
                                            'text-violet-400',
                                            'text-amber-400',
                                            'text-rose-400',
                                            'text-cyan-400',
                                            'text-indigo-400',
                                            'text-orange-400'
                                          ][itemIndex % 8]
                                      )}
                                    >
                                      <item.icon className='size-4' />
                                      {isActive && (
                                        <div className='absolute inset-0 bg-primary-500/20 rounded-md animate-ping opacity-20' />
                                      )}
                                    </div>

                                    <span
                                      className={cn(
                                        'text-xs font-medium transition-colors duration-200 truncate flex-1 min-w-0 group-data-[collapsible=icon]:hidden',
                                        isActive
                                          ? 'text-sidebar-foreground'
                                          : 'text-sidebar-foreground/80 group-hover/item:text-sidebar-foreground'
                                      )}
                                    >
                                      {item.title}
                                    </span>

                                    {item.badge && (
                                      <span className='ml-auto text-xs px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded-md flex-shrink-0'>
                                        {item.badge}
                                      </span>
                                    )}

                                    <IconChevronRight className='size-3.5 text-sidebar-foreground/40 opacity-0 group-hover/item:opacity-100 transition-all duration-200 ml-1 flex-shrink-0 group-data-[collapsible=icon]:hidden' />
                                  </Link>
                                </motion.div>
                              )
                            })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {sectionIndex < sidebarConfig.sections.length - 1 && (
                <Separator className='my-2 bg-gradient-to-r from-transparent via-sidebar-border/30 to-transparent h-px w-full' />
              )}
            </React.Fragment>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter className='border-t border-sidebar-border/30 bg-sidebar/95 backdrop-blur-lg'>
        <div className='px-2 py-3 w-full'>
          <div className='relative w-full'>
            <div className='absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
            <NavUser />
            <div className='absolute right-3 bottom-3'>
              <div className='relative'>
                <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
                <div className='absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping' />
              </div>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
