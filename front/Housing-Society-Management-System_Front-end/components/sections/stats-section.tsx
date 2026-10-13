// components/sections/stats-section.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, CreditCard, Shield, Zap } from 'lucide-react'

export function StatsSection () {
  const stats = [
    {
      label: 'Societies Managed',
      value: '500+',
      change: '+15% this year',
      icon: Shield,
      color: 'blue'
    },
    {
      label: 'Residents Served',
      value: '50K+',
      change: 'Across 15+ cities',
      icon: Users,
      color: 'green'
    },
    {
      label: 'Payment Processed',
      value: '₹200Cr+',
      change: 'Annually',
      icon: CreditCard,
      color: 'amber'
    },
    {
      label: 'Uptime',
      value: '99.9%',
      change: 'Enterprise SLA',
      icon: Zap,
      color: 'purple'
    }
  ]

  return (
    <section className='py-20 bg-gradient-to-r from-primary/5 to-primary/10'>
      <div className='container px-4 mx-auto'>
        <div className='text-center mb-12'>
          <Badge variant='outline' className='mb-4'>
            <TrendingUp className='h-3.5 w-3.5 mr-2' />
            Enterprise Metrics
          </Badge>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            Trusted by Leading Societies
          </h2>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Scale with confidence using our proven platform
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.label}
                className='border shadow-sm hover:shadow-md transition-shadow'
              >
                <CardContent className='p-6'>
                  <div className='flex items-center gap-4 mb-4'>
                    <div
                      className={`p-3 rounded-lg ${
                        stat.color === 'blue'
                          ? 'bg-blue-100 text-blue-600'
                          : stat.color === 'green'
                          ? 'bg-green-100 text-green-600'
                          : stat.color === 'amber'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}
                    >
                      <Icon className='h-6 w-6' />
                    </div>
                    <div>
                      <div className='text-3xl font-bold'>{stat.value}</div>
                      <div className='text-sm text-muted-foreground'>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {stat.change}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className='mt-12 text-center'>
          <p className='text-sm text-muted-foreground'>
            Real-time metrics updated every 5 minutes • Enterprise-grade
            monitoring • 24/7 support
          </p>
        </div>
      </div>
    </section>
  )
}
