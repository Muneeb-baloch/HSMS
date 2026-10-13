// components/sections/interactive-dashboard.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CreditCard,
  MessageSquare,
  Users
} from 'lucide-react'
import { useState } from 'react'
import { Progress } from '../ui/progress'

export function InteractiveDashboard () {
  const [timeRange, setTimeRange] = useState('monthly')

  const stats = [
    {
      label: 'Total Residents',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users
    },
    {
      label: 'Monthly Revenue',
      value: '₹2.8Cr',
      change: '+8.2%',
      trend: 'up',
      icon: CreditCard
    },
    {
      label: 'Active Complaints',
      value: '42',
      change: '-15.3%',
      trend: 'down',
      icon: MessageSquare
    },
    {
      label: 'Notifications Sent',
      value: '3,821',
      change: '+24.7%',
      trend: 'up',
      icon: Bell
    }
  ]

  const complaints = [
    {
      id: 'CPT-001',
      category: 'Plumbing',
      status: 'In Progress',
      priority: 'High',
      days: 2
    },
    {
      id: 'CPT-002',
      category: 'Electrical',
      status: 'Pending',
      priority: 'Medium',
      days: 1
    },
    {
      id: 'CPT-003',
      category: 'Security',
      status: 'Resolved',
      priority: 'High',
      days: 0
    },
    {
      id: 'CPT-004',
      category: 'Cleaning',
      status: 'In Progress',
      priority: 'Low',
      days: 3
    }
  ]

  const payments = [
    { sector: 'Sector A', collected: 9500000, target: 10000000, progress: 95 },
    { sector: 'Sector B', collected: 7200000, target: 8000000, progress: 90 },
    { sector: 'Sector C', collected: 6300000, target: 7000000, progress: 90 },
    { sector: 'Sector D', collected: 5100000, target: 6000000, progress: 85 }
  ]

  return (
    <section className='py-20 bg-muted/30'>
      <div className='container px-4 mx-auto'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Interactive Dashboard Preview
          </h2>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Experience the power of real-time analytics and comprehensive
            management tools
          </p>
        </div>

        <Card className='border shadow-xl'>
          <CardHeader className='border-b'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-2xl'>Executive Dashboard</CardTitle>
              <div className='flex items-center gap-3'>
                <Tabs
                  value={timeRange}
                  onValueChange={setTimeRange}
                  className='w-[200px]'
                >
                  <TabsList className='grid grid-cols-3'>
                    <TabsTrigger value='daily'>Daily</TabsTrigger>
                    <TabsTrigger value='weekly'>Weekly</TabsTrigger>
                    <TabsTrigger value='monthly'>Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant='outline' size='sm'>
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className='p-6'>
            {/* Stats Grid */}
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              {stats.map(stat => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className='border shadow-sm'>
                    <CardContent className='p-6'>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='p-2 bg-primary/10 rounded-lg'>
                          <Icon className='h-5 w-5 text-primary' />
                        </div>
                        <Badge
                          variant={
                            stat.trend === 'up' ? 'default' : 'secondary'
                          }
                          className='gap-1'
                        >
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className='h-3 w-3' />
                          ) : (
                            <ArrowDownRight className='h-3 w-3' />
                          )}
                          {stat.change}
                        </Badge>
                      </div>
                      <div className='text-3xl font-bold mb-2'>
                        {stat.value}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className='grid lg:grid-cols-2 gap-6'>
              {/* Complaints Section */}
              <Card className='border'>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center justify-between'>
                    <span>Recent Complaints</span>
                    <Button variant='ghost' size='sm'>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {complaints.map(complaint => (
                      <div
                        key={complaint.id}
                        className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors'
                      >
                        <div>
                          <div className='font-medium'>{complaint.id}</div>
                          <div className='text-sm text-muted-foreground'>
                            {complaint.category}
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <Badge
                            variant={
                              complaint.status === 'Resolved'
                                ? 'default'
                                : complaint.status === 'In Progress'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {complaint.status}
                          </Badge>
                          <Badge
                            variant={
                              complaint.priority === 'High'
                                ? 'destructive'
                                : complaint.priority === 'Medium'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {complaint.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payments Progress */}
              <Card className='border'>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center justify-between'>
                    <span>Payment Collection</span>
                    <div className='text-sm font-normal text-muted-foreground'>
                      Total: ₹2.81Cr / ₹3.1Cr
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    {payments.map(payment => (
                      <div key={payment.sector} className='space-y-2'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='font-medium'>{payment.sector}</span>
                          <span>₹{payment.collected.toLocaleString()}</span>
                        </div>
                        <div className='flex items-center gap-3'>
                          <Progress value={payment.progress} className='h-2' />
                          <span className='text-sm font-medium min-w-[40px]'>
                            {payment.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='mt-6 pt-6 border-t'>
                    <div className='flex items-center justify-between'>
                      <div className='text-sm text-muted-foreground'>
                        Overall Progress
                      </div>
                      <div className='text-lg font-bold'>90.6%</div>
                    </div>
                    <Progress value={90.6} className='h-3 mt-2' />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Placeholder */}
            <Card className='border mt-6'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-[300px] flex items-center justify-center bg-muted/50 rounded-lg'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-muted-foreground'>
                      📈
                    </div>
                    <div className='text-muted-foreground mt-2'>
                      Interactive chart would appear here
                    </div>
                    <div className='text-sm text-muted-foreground mt-1'>
                      Showing revenue trends for {timeRange} period
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className='text-center mt-8'>
          <p className='text-sm text-muted-foreground'>
            This is a preview. Actual dashboard includes 50+ metrics, custom
            reports, and real-time updates.
          </p>
        </div>
      </div>
    </section>
  )
}
