// components/sections/platform-showcase.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cloud, Monitor, Shield, Smartphone, Tablet, Zap } from 'lucide-react'

export function PlatformShowcase () {
  const platforms = [
    {
      id: 'web',
      title: 'Management Dashboard',
      icon: Monitor,
      description: 'Complete web dashboard for administrators',
      features: [
        'Real-time analytics',
        'User management',
        'Financial reports',
        'System configuration'
      ]
    },
    {
      id: 'mobile',
      title: 'Resident Mobile App',
      icon: Smartphone,
      description: 'Native mobile application for residents',
      features: ['Payments', 'Complaints', 'Notifications', 'Community']
    },
    {
      id: 'staff',
      title: 'Staff Portal',
      icon: Tablet,
      description: 'Dedicated portal for staff members',
      features: ['Task management', 'Work orders', 'Reporting', 'Communication']
    }
  ]

  return (
    <section className='py-20 bg-gradient-to-b from-background to-muted/20'>
      <div className='container px-4 mx-auto'>
        <div className='text-center mb-12'>
          <Badge variant='outline' className='mb-4'>
            <Cloud className='h-3.5 w-3.5 mr-2' />
            Multi-Platform Solution
          </Badge>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            One Platform, Multiple Interfaces
          </h2>
          <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
            Access your society management system from any device with
            synchronized data across all platforms.
          </p>
        </div>

        <Tabs defaultValue='web' className='max-w-6xl mx-auto'>
          <TabsList className='grid w-full grid-cols-3 mb-12'>
            {platforms.map(platform => {
              const Icon = platform.icon
              return (
                <TabsTrigger
                  key={platform.id}
                  value={platform.id}
                  className='flex items-center gap-3'
                >
                  <Icon className='h-5 w-5' />
                  {platform.title}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {platforms.map(platform => (
            <TabsContent key={platform.id} value={platform.id}>
              <Card className='border shadow-lg overflow-hidden'>
                <CardContent className='p-8'>
                  <div className='grid lg:grid-cols-2 gap-8 items-center'>
                    <div>
                      <div className='flex items-center gap-3 mb-6'>
                        <div className='p-3 bg-primary/10 rounded-lg'>
                          <platform.icon className='h-8 w-8 text-primary' />
                        </div>
                        <div>
                          <h3 className='text-2xl font-bold'>
                            {platform.title}
                          </h3>
                          <p className='text-muted-foreground'>
                            {platform.description}
                          </p>
                        </div>
                      </div>

                      <div className='space-y-4 mb-8'>
                        {platform.features.map((feature, index) => (
                          <div key={index} className='flex items-center gap-3'>
                            <div className='p-1 bg-green-100 rounded'>
                              <Zap className='h-4 w-4 text-green-600' />
                            </div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className='flex gap-3'>
                        <Badge variant='secondary'>
                          <Shield className='h-3 w-3 mr-1' />
                          Secure
                        </Badge>
                        <Badge variant='secondary'>
                          <Cloud className='h-3 w-3 mr-1' />
                          Cloud Sync
                        </Badge>
                        <Badge variant='secondary'>Real-time</Badge>
                      </div>
                    </div>

                    {/* Platform Preview */}
                    <div className='relative'>
                      <div
                        className={`relative mx-auto ${
                          platform.id === 'mobile'
                            ? 'max-w-[280px]'
                            : 'max-w-full'
                        }`}
                      >
                        <div
                          className={`${
                            platform.id === 'web'
                              ? 'aspect-video'
                              : 'aspect-[9/16]'
                          } bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800 p-4`}
                        >
                          {/* Mock UI */}
                          <div className='h-full bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden'>
                            <div className='p-4 border-b border-gray-700/50'>
                              <div className='flex items-center justify-between'>
                                <div className='h-3 w-24 bg-gray-700 rounded' />
                                <div className='h-6 w-6 bg-gray-700 rounded' />
                              </div>
                            </div>
                            <div className='p-4 space-y-4'>
                              {[1, 2, 3].map(i => (
                                <div key={i} className='space-y-2'>
                                  <div className='h-2 w-full bg-gray-700 rounded' />
                                  <div className='h-2 w-3/4 bg-gray-700/50 rounded' />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
