// components/layout/navbar.tsx
'use client'

import { Button } from '@/components/ui/button'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Building2, Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Separator } from '../ui/separator'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '../ui/navigation-menu'

export function Navbar () {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    {
      title: 'Product',
      items: [
        {
          title: 'Features',
          href: '/features',
          description: 'Complete feature set'
        },
        {
          title: 'Solutions',
          href: '/solutions',
          description: 'Industry solutions'
        },
        { title: 'Pricing', href: '/pricing', description: 'Plans & pricing' },
        {
          title: 'Integrations',
          href: '/integrations',
          description: 'Third-party integrations'
        }
      ]
    },
    {
      title: 'Resources',
      items: [
        {
          title: 'Documentation',
          href: '/docs',
          description: 'Developer docs'
        },
        {
          title: 'API Reference',
          href: '/api',
          description: 'API documentation'
        },
        { title: 'Blog', href: '/blog', description: 'Latest updates' },
        { title: 'Guides', href: '/guides', description: 'How-to guides' }
      ]
    },
    {
      title: 'Company',
      items: [
        { title: 'About', href: '/about', description: 'Our story' },
        { title: 'Careers', href: '/careers', description: 'Join our team' },
        { title: 'Contact', href: '/contact', description: 'Get in touch' },
        { title: 'Partners', href: '/partners', description: 'Partner program' }
      ]
    }
  ]

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between px-4 mx-auto'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Building2 className='h-5 w-5 text-primary' />
          </div>
          <div>
            <div className='text-lg font-bold'>HSMS</div>
            <div className='text-xs text-muted-foreground'>Enterprise</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden lg:flex items-center gap-6'>
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map(item => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger className='h-9'>
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className='grid w-[400px] gap-3 p-4'>
                      {item.items.map(subItem => (
                        <NavigationMenuLink key={subItem.title} asChild>
                          <Link
                            href={subItem.href}
                            className='block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                          >
                            <div className='text-sm font-medium leading-none'>
                              {subItem.title}
                            </div>
                            <p className='text-sm leading-snug text-muted-foreground'>
                              {subItem.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Link href='/demo'>
            <Button variant='ghost' size='sm'>
              Demo
            </Button>
          </Link>
        </div>

        {/* Right Actions */}
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='h-9 w-9'
          >
            <Sun className='h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Toggle theme</span>
          </Button>

          <div className='hidden lg:flex items-center gap-2'>
            <Link href='/login'>
              <Button variant='ghost' size='sm'>
                Sign in
              </Button>
            </Link>
            <Link href='/signup'>
              <Button size='sm'>Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className='lg:hidden'>
              <Button variant='ghost' size='icon' className='h-9 w-9'>
                <Menu className='h-5 w-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
              <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center gap-3'>
                  <Building2 className='h-6 w-6 text-primary' />
                  <div>
                    <div className='text-lg font-bold'>HSMS</div>
                    <div className='text-xs text-muted-foreground'>
                      Enterprise
                    </div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className='h-5 w-5' />
                </Button>
              </div>

              <div className='space-y-6'>
                {navItems.map(item => (
                  <div key={item.title}>
                    <div className='text-sm font-medium mb-3'>{item.title}</div>
                    <div className='space-y-2 pl-3'>
                      {item.items.map(subItem => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className='block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                <Separator />

                <div className='space-y-3'>
                  <Link href='/login'>
                    <Button variant='outline' className='w-full'>
                      Sign in
                    </Button>
                  </Link>
                  <Link href='/signup'>
                    <Button className='w-full'>Get Started</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
