'use client'

import { IconCirclePlusFilled, IconMail } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { ElementType } from 'react'

export function NavMain ({
  items
}: {
  items: {
    title: string
    url: string
    icon?: ElementType
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2 scrollbar-hide  border-t border-t-gray-400 '>
        <SidebarMenu>
          <SidebarMenuItem
            className='flex items-center gap-2 scrollbar-hide
'
          >
            <SidebarMenuButton
              tooltip='Quick Create'
              className='bg-gray-500 my-2 text-primary-foreground hover:bg-gray-600
hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
            >
              <IconCirclePlusFilled className='' />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size='icon'
              className='size-8 bg-gray-500 hover:bg-gray-600
 group-data-[collapsible=icon]:opacity-0'
              // variant='outline'
            >
              <IconMail />
              <span className='sr-only'>Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map(item => {
            // Ensure icon is defined
            const IconComponent = item.icon ?? null

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url} className='flex items-center gap-2'>
                    {IconComponent && <IconComponent className='size-4' />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
