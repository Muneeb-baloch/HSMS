'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  IconSettings,
  IconUsers,
  IconShield,
  IconUserCircle,
  IconLock,
  IconBell,
  IconPalette,
  IconBuilding,
} from '@tabler/icons-react'
import Link from 'next/link'

interface SettingsCard {
  title: string
  description: string
  href: string
  icon: React.ElementType
  roles?: UserRole[]
}

const settingsCards: SettingsCard[] = [
  {
    title: 'Profile',
    description: 'Update your personal information, avatar, and contact details',
    href: '/profile',
    icon: IconUserCircle,
  },
  {
    title: 'Privacy Settings',
    description: 'Control data visibility, consent preferences, and access logs',
    href: '/privacy-settings',
    icon: IconLock,
  },
  {
    title: 'Notifications',
    description: 'Configure email, push, and SMS notification preferences',
    href: '/profile',
    icon: IconBell,
  },
  {
    title: 'User Management',
    description: 'Manage staff accounts, assign roles, and control access',
    href: '/userstaff',
    icon: IconUsers,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    title: 'Role Management',
    description: 'Create custom roles and configure module permissions',
    href: '/roles',
    icon: IconShield,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    title: 'Permissions',
    description: 'View and manage role-based permission matrix',
    href: '/permissions',
    icon: IconSettings,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    title: 'Society Settings',
    description: 'Configure society details, currency, timezone, and branding',
    href: '/societies',
    icon: IconBuilding,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    title: 'Subscription',
    description: 'View your current plan, usage, and billing history',
    href: '/subscription',
    icon: IconPalette,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const userRole = (user?.role as UserRole) || UserRole.USER

  const visibleCards = settingsCards.filter(
    card => !card.roles || hasPermission(userRole, card.roles)
  )

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account, preferences, and system configuration
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {visibleCards.map(card => (
          <Link key={card.href} href={card.href}>
            <Card className='h-full transition-all hover:shadow-md hover:border-primary/30 cursor-pointer'>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10'>
                    <card.icon className='size-5 text-primary' />
                  </div>
                  <CardTitle className='text-base'>{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
