// components/sections/hero-section.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  LineChart,
  Shield,
  Zap
} from 'lucide-react'
import { useState } from 'react'

export function HeroSection () {
  const [email, setEmail] = useState('')

  const features = [
    { icon: Shield, text: 'Enterprise-grade security' },
    { icon: LineChart, text: 'Real-time analytics' },
    { icon: Cloud, text: 'Cloud-native architecture' },
    { icon: Zap, text: 'High performance' }
  ]

  return (
    <section className='relative overflow-hidden py-20 lg:py-32'>
      {/* Background Gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background' />
      <div className='absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl' />

      <div className='container relative px-4 mx-auto'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Left Content */}
          <div>
            <Badge className='mb-6 py-1.5 px-4 bg-primary/10 text-primary border-primary/20'>
              <Zap className='h-3.5 w-3.5 mr-2' />
              Now Available: Enterprise Edition
            </Badge>

            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6'>
              Scale Your Society Operations
              <span className='block text-primary'>With Enterprise Power</span>
            </h1>

            <p className='text-xl text-muted-foreground mb-8 max-w-2xl'>
              The most comprehensive housing society management platform for
              large communities. Manage thousands of residents, automate
              workflows, and gain real-time insights.
            </p>

            {/* Features List */}
            <div className='grid sm:grid-cols-2 gap-3 mb-8'>
              {features.map(feature => {
                const Icon = feature.icon
                return (
                  <div key={feature.text} className='flex items-center gap-2'>
                    <div className='p-1 bg-primary/10 rounded'>
                      <Icon className='h-4 w-4 text-primary' />
                    </div>
                    <span className='text-sm'>{feature.text}</span>
                  </div>
                )
              })}
            </div>

            {/* CTA Form */}
            <div className='flex flex-col sm:flex-row gap-3 max-w-md'>
              <Input
                type='email'
                placeholder='Enter your work email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='h-12'
              />
              <Button size='lg' className='h-12 gap-2'>
                Request Demo
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>

            <p className='text-sm text-muted-foreground mt-4'>
              Join 500+ enterprise customers • 14-day free trial • No credit
              card required
            </p>
          </div>

          {/* Right Stats Card */}
          <div className='relative'>
            <Card className='border shadow-xl overflow-hidden'>
              <CardContent className='p-0'>
                {/* Stats Header */}
                <div className='p-6 border-b bg-muted/50'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
                      <span className='text-sm font-medium'>
                        Live Dashboard
                      </span>
                    </div>
                    <Badge variant='outline' className='text-xs'>
                      Updated just now
                    </Badge>
                  </div>

                  {/* Stats Grid */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <div className='text-2xl font-bold'>Rs. 2.8Cr</div>
                      <div className='text-xs text-muted-foreground'>
                        Monthly Revenue
                      </div>
                      <div className='h-2 bg-green-100 rounded-full overflow-hidden'>
                        <div className='h-full bg-green-500 rounded-full w-4/5' />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='text-2xl font-bold'>98.7%</div>
                      <div className='text-xs text-muted-foreground'>
                        Payment Rate
                      </div>
                      <div className='h-2 bg-blue-100 rounded-full overflow-hidden'>
                        <div className='h-full bg-blue-500 rounded-full w-[98.7%]' />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity List */}
                <div className='p-6'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-100 rounded'>
                          <CheckCircle2 className='h-4 w-4 text-blue-600' />
                        </div>
                        <div>
                          <div className='font-medium'>Payment Automation</div>
                          <div className='text-xs text-muted-foreground'>
                            Rs. 42L processed today
                          </div>
                        </div>
                      </div>
                      <Badge variant='secondary'>Active</Badge>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-green-100 rounded'>
                          <CheckCircle2 className='h-4 w-4 text-green-600' />
                        </div>
                        <div>
                          <div className='font-medium'>
                            Complaint Resolution
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            89% within 24h
                          </div>
                        </div>
                      </div>
                      <Badge variant='secondary'>Optimized</Badge>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-amber-100 rounded'>
                          <CheckCircle2 className='h-4 w-4 text-amber-600' />
                        </div>
                        <div>
                          <div className='font-medium'>Announcements</div>
                          <div className='text-xs text-muted-foreground'>
                            3 active broadcasts
                          </div>
                        </div>
                      </div>
                      <Badge variant='secondary'>Live</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
