'use client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export function SiteHeader () {
  return (
    <header className='flex h-12 shrink-0 items-center gap-2 border-b bg-background z-10'>
      <div className='flex w-full items-center gap-2 px-3 lg:px-4'>
        <SidebarTrigger className='-ml-1 size-8' />
        <Separator
          orientation='vertical'
          className='mx-1.5 data-[orientation=vertical]:h-3.5'
        />
        <h1 className='text-sm font-medium'>
          Housing Socity Mangment System
        </h1>
        <div className='ml-auto flex items-center gap-2'>
          <NotificationBell />
          <Button variant='ghost' asChild size='sm' className='hidden sm:flex text-xs'>
            <a
              href='https://github.com/MUbaidJavaid/'
              rel='noopener noreferrer'
              target='_blank'
              className='dark:text-foreground'
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
