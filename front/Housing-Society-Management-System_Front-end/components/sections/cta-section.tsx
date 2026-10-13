// components/sections/cta-section.tsx
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  MessageSquare,
  Shield,
  Zap
} from 'lucide-react'

export function CTASection () {
  const features = [
    { icon: Shield, text: 'Enterprise Security' },
    { icon: Zap, text: 'High Performance' },
    { icon: Cloud, text: 'Cloud Native' },
    { icon: MessageSquare, text: '24/7 Support' }
  ]

  const benefits = [
    '14-day free trial',
    'No credit card required',
    'Cancel anytime',
    'Dedicated onboarding'
  ]

  return (
    <section className='py-20 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground'>
      <div className='container px-4 mx-auto'>
        <div className='max-w-6xl mx-auto'>
          <Card className='border-0 shadow-2xl bg-background'>
            <CardContent className='p-8 lg:p-12'>
              <div className='grid lg:grid-cols-2 gap-12'>
                {/* Left Column */}
                <div>
                  <Badge className='mb-6 bg-primary/10 text-primary border-primary/20'>
                    Limited Time Offer
                  </Badge>

                  <h2 className='text-3xl lg:text-4xl font-bold mb-6'>
                    Start Your Digital Transformation Today
                  </h2>

                  <p className='text-lg text-muted-foreground mb-8'>
                    Join 500+ housing societies that trust HSMS for their
                    management needs. Get started with our enterprise platform.
                  </p>

                  <div className='space-y-6 mb-8'>
                    {features.map(feature => {
                      const Icon = feature.icon
                      return (
                        <div
                          key={feature.text}
                          className='flex items-center gap-3'
                        >
                          <div className='p-2 bg-primary/10 rounded'>
                            <Icon className='h-5 w-5 text-primary' />
                          </div>
                          <span className='font-medium'>{feature.text}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className='space-y-2'>
                    {benefits.map(benefit => (
                      <div
                        key={benefit}
                        className='flex items-center gap-2 text-sm'
                      >
                        <CheckCircle2 className='h-4 w-4 text-green-500' />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Form */}
                <div>
                  <h3 className='text-2xl font-bold mb-6'>
                    Request Enterprise Demo
                  </h3>

                  <form className='space-y-4'>
                    <div className='grid sm:grid-cols-2 gap-4'>
                      <Input placeholder='First Name' className='h-12' />
                      <Input placeholder='Last Name' className='h-12' />
                    </div>

                    <Input
                      type='email'
                      placeholder='Work Email'
                      className='h-12'
                    />

                    <Input placeholder='Company Name' className='h-12' />

                    <Input placeholder='Phone Number' className='h-12' />

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Number of Residents
                      </label>
                      <select className='w-full h-12 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                        <option value=''>Select range</option>
                        <option value='1-100'>1-100 Residents</option>
                        <option value='101-500'>101-500 Residents</option>
                        <option value='501-2000'>501-2000 Residents</option>
                        <option value='2000+'>2000+ Residents</option>
                      </select>
                    </div>

                    <Button size='lg' className='w-full h-12 gap-2'>
                      Schedule Demo
                      <ArrowRight className='h-4 w-4' />
                    </Button>
                  </form>

                  <Separator className='my-6' />

                  <div className='text-center'>
                    <p className='text-sm text-muted-foreground'>
                      By requesting a demo, you agree to our{' '}
                      <a href='/terms' className='text-primary hover:underline'>
                        Terms
                      </a>{' '}
                      and{' '}
                      <a
                        href='/privacy'
                        className='text-primary hover:underline'
                      >
                        Privacy Policy
                      </a>
                    </p>
                    <p className='text-xs text-muted-foreground mt-2'>
                      Response time: Within 24 hours • Available: Mon-Fri
                      9AM-6PM
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Stats */}
          <div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
            <div>
              <div className='text-2xl font-bold text-primary-foreground'>
                24/7
              </div>
              <div className='text-sm text-primary-foreground/80'>Support</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-primary-foreground'>
                30-min
              </div>
              <div className='text-sm text-primary-foreground/80'>
                Response Time
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-primary-foreground'>
                99.9%
              </div>
              <div className='text-sm text-primary-foreground/80'>
                Uptime SLA
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-primary-foreground'>
                500+
              </div>
              <div className='text-sm text-primary-foreground/80'>
                Happy Customers
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
