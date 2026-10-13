// nav-user.tsx - Enhanced with smooth animations
'use client'

import { useToast } from '@/components/context/ToastContext'
import { apiClient } from '@/lib/API/client'
import { logout as logoutAction } from '@/lib/store/slices/authSlice'
import { RootState } from '@/lib/store/store'
import {
  IconBell,
  IconChevronUp,
  IconCreditCard,
  IconLogout,
  IconSettings,
  IconShield,
  IconUserCircle
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function NavUser () {
  const { isMobile } = useSidebar()
  const dispatch = useDispatch()
  const router = useRouter()
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const user = useSelector((state: RootState) => state?.auth.user)

  if (!user) {
    return null
  }

  const getFullName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    } else if (user.firstName) {
      return user.firstName
    } else if (user.lastName) {
      return user.lastName
    } else {
      return user.email?.split('@')[0] || 'User'
    }
  }

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    } else if (user.firstName) {
      return user.firstName[0].toUpperCase()
    } else if (user.lastName) {
      return user.lastName[0].toUpperCase()
    } else if (user.email) {
      return user.email[0].toUpperCase()
    } else {
      return 'U'
    }
  }

  const getDisplayName = () => {
    const fullName = getFullName()
    if (fullName && fullName !== 'User') {
      return fullName
    }
    return user.email?.split('@')[0] || 'User'
  }

  const handleLogout = async () => {
    try {
      await apiClient.logout()
      dispatch(logoutAction())
      showToast('Logged out successfully', 'success')
      router.push('/login')
    } catch (error: unknown) {
      console.error('Logout error:', error)
      let errorMessage = 'Logout failed'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } }
        }
        errorMessage = axiosError.response?.data?.message || errorMessage
      }
      showToast(errorMessage, 'error')
      dispatch(logoutAction())
      router.push('/login')
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className={cn(
                'group relative overflow-hidden transition-all duration-300',
                isOpen
                  ? 'bg-sidebar-accent/30 shadow-inner'
                  : 'hover:bg-sidebar-accent/20 hover:shadow-md'
              )}
            >
              {/* Background glow on hover */}
              <div className='absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

              {/* Avatar with status indicator */}
              <div className='relative'>
                <Avatar className='h-9 w-9 rounded-xl ring-2 ring-sidebar-border/50 ring-offset-2 ring-offset-sidebar transition-all duration-300 group-hover:ring-primary-500/50'>
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={getFullName()} />
                  ) : (
                    <AvatarFallback className='rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-semibold'>
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {/* Online indicator */}
                <div className='absolute -bottom-0.5 -right-0.5'>
                  <div className='relative'>
                    <div className='w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-sidebar' />
                    <div className='absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping' />
                  </div>
                </div>
              </div>

              {/* User info */}
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold text-sidebar-foreground group-hover:text-primary-400 transition-colors duration-200'>
                  {getDisplayName()}
                </span>
                <span className='text-sidebar-foreground/60 truncate text-xs group-hover:text-sidebar-foreground/80 transition-colors duration-200'>
                  {user.email || 'user@example.com'}
                </span>
              </div>

              {/* Animated chevron */}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className='ml-auto'
              >
                <IconChevronUp className='size-4 text-sidebar-foreground/40' />
              </motion.div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-sidebar-border/50 bg-sidebar/95 backdrop-blur-lg shadow-xl'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={8}
          >
            {/* User header */}
            <DropdownMenuLabel className='p-0 font-normal'>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex items-center gap-3 p-3'
              >
                <Avatar className='h-10 w-10 ring-2 ring-sidebar-border/50 ring-offset-2 ring-offset-sidebar rounded-xl'>
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={getFullName()} />
                  ) : (
                    <AvatarFallback className='rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-semibold'>
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate text-white font-semibold'>
                    {getFullName()}
                  </span>
                  <span className='text-sidebar-foreground/60 truncate text-xs'>
                    {user.email || 'user@example.com'}
                  </span>
                  <div className='flex items-center gap-1 mt-1'>
                    <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
                    <span className='text-xs text-emerald-400 font-medium'>
                      Online
                    </span>
                  </div>
                </div>
              </motion.div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className='bg-sidebar-border/50' />

            {/* Menu items with animations */}
            <DropdownMenuGroup>
              {[
                {
                  icon: IconUserCircle,
                  label: 'Profile',
                  onClick: () => router.push('/profile')
                },
                {
                  icon: IconSettings,
                  label: 'Settings',
                  onClick: () => router.push('/settings')
                },
                {
                  icon: IconBell,
                  label: 'Notifications',
                  onClick: () => router.push('/notifications')
                },
                {
                  icon: IconShield,
                  label: 'Privacy',
                  onClick: () => router.push('/privacy')
                },
                {
                  icon: IconCreditCard,
                  label: 'Billing',
                  onClick: () => router.push('/billing')
                }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DropdownMenuItem
                    onClick={item.onClick}
                    className='cursor-pointer group hover:text-blue-500
 transition-colors duration-200 group/item'
                  >
                    <item.icon className='mr-2 h-4 w-4  group-hover:text-blue-600 text-sidebar-foreground/60 group-hover/item:text-primary-400 transition-colors' />
                    <span className='text-sidebar-foreground/60 group-hover:text-blue-600 transition-colors'>
                      {item.label}
                    </span>
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className='bg-sidebar-border/50' />

            {/* Logout item */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <DropdownMenuItem
                onClick={handleLogout}
                className='cursor-pointer hover:bg-destructive/20 text-destructive transition-colors duration-200 group/logout'
              >
                <IconLogout className='mr-2 h-4 w-4 group-hover/logout:scale-110 transition-transform' />
                <span>Log out</span>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
