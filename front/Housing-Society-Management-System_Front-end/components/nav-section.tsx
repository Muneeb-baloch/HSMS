// nav-section.tsx - Enhanced with better animations
'use client'

import { IconChevronRight, IconDotsVertical } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { SidebarNavItem } from '@/lib/constants/sidebar.constants'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavSectionProps {
  items: SidebarNavItem[]
  className?: string
}

export function NavSection ({ items, className }: NavSectionProps) {
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  // Group items by sections
  const sections: Array<{
    title?: string
    items: SidebarNavItem[]
  }> = []

  let currentSection: {
    title?: string
    items: SidebarNavItem[]
  } = { items: [] }

  items.forEach(item => {
    if (item.sectionTitle) {
      if (currentSection.items.length > 0) {
        sections.push({ ...currentSection })
      }
      currentSection = {
        title: item.sectionTitle,
        items: []
      }
    } else if (item.isDivider) {
      sections.push({
        title: undefined,
        items: [item]
      })
    } else {
      currentSection.items.push(item)
    }
  })

  if (currentSection.items.length > 0) {
    sections.push(currentSection)
  }

  if (sections.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence mode='wait'>
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <React.Fragment>
              {section.title ? (
                <SidebarGroup>
                  {section.title && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <SidebarGroupLabel className='text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60'>
                        {section.title}
                      </SidebarGroupLabel>
                    </motion.div>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: itemIndex * 0.05 }}
                        >
                          <NavItem
                            item={item}
                            pathname={pathname}
                            isMobile={isMobile}
                          />
                        </motion.div>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ) : section.items.length === 1 && section.items[0].isDivider ? (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className='h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent my-3'
                />
              ) : (
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: itemIndex * 0.05 }}
                        >
                          <NavItem
                            item={item}
                            pathname={pathname}
                            isMobile={isMobile}
                          />
                        </motion.div>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </React.Fragment>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface NavItemProps {
  item: SidebarNavItem
  pathname: string
  isMobile: boolean
}

function NavItem ({ item, pathname, isMobile }: NavItemProps) {
  const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)

  const IconComponent = item.icon

  if (item.isDivider) {
    return null
  }

  return (
    <SidebarMenuItem className='group'>
      <div className='relative w-full'>
        {/* Active indicator with glow */}
        {isActive && (
          <>
            <motion.div
              layoutId='activeGlow'
              className='absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-gradient-to-b from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/30'
              initial={false}
            />
            <div className='absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent rounded-lg' />
          </>
        )}

        {/* Main button */}
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            isActive
              ? 'bg-gradient-to-r from-primary-500/15 to-transparent text-sidebar-accent-foreground shadow-sm'
              : 'hover:bg-sidebar-accent/20 hover:shadow-md hover:translate-x-1'
          )}
        >
          <Link
            href={item.url}
            aria-current={isActive ? 'page' : undefined}
            className='group/button'
          >
            {/* Icon with animation */}
            <div
              className={cn(
                'relative p-2 rounded-lg transition-all duration-300',
                isActive
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-white/5 text-sidebar-foreground/60 group-hover/button:bg-white/10 group-hover/button:text-sidebar-foreground/80'
              )}
            >
              {IconComponent && <IconComponent className='size-4' />}
              {/* Ripple effect on click */}
              <div className='absolute inset-0 rounded-lg bg-white/10 opacity-0 group-active/button:opacity-100 transition-opacity duration-300' />
            </div>

            {/* Title */}
            <motion.span
              layout='position'
              className={cn(
                'text-sm font-medium transition-colors duration-300',
                isActive
                  ? 'text-sidebar-foreground font-semibold'
                  : 'text-sidebar-foreground/80 group-hover/button:text-sidebar-foreground'
              )}
            >
              {item.title}
            </motion.span>

            {/* Badge */}
            {item.badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className='ml-auto text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full'
              >
                {item.badge}
              </motion.span>
            )}

            {/* Hover chevron */}
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: isActive ? 1 : 0 }}
              className='ml-auto'
            >
              <IconChevronRight className='size-3.5 text-sidebar-foreground/60' />
            </motion.div>
          </Link>
        </SidebarMenuButton>
      </div>

      {/* Children dropdown */}
      {item.children && item.children.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              showOnHover
              className='opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-all duration-300 hover:scale-110'
            >
              <IconDotsVertical className='size-4' />
              <span className='sr-only'>More options for {item.title}</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-48 rounded-lg border border-sidebar-border/50 bg-sidebar/95 backdrop-blur-lg shadow-xl'
            side={isMobile ? 'bottom' : 'right'}
            align={isMobile ? 'end' : 'start'}
          >
            {item.children.map((child, index) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DropdownMenuItem
                  asChild
                  className='cursor-pointer hover:bg-sidebar-accent/30 transition-colors'
                >
                  <Link href={child.url} className='flex items-center gap-2'>
                    <child.icon className='size-3.5 text-sidebar-foreground/60' />
                    {child.title}
                  </Link>
                </DropdownMenuItem>
              </motion.div>
            ))}
            <DropdownMenuSeparator className='bg-sidebar-border/50' />
            <DropdownMenuItem
              asChild
              className='cursor-pointer font-medium hover:bg-primary-500/20 transition-colors'
            >
              <Link
                href={item.url}
                className='flex items-center gap-2 text-primary-400'
              >
                <IconChevronRight className='size-3.5' />
                View All {item.title}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SidebarMenuItem>
  )
}
