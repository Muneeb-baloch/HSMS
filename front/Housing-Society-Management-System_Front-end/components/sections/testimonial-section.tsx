// components/sections/testimonial-section.tsx
'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

export function TestimonialSection () {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Society President',
      company: 'Green Valley Apartments',
      content:
        'HSMS transformed our 500-unit society. Payment collection efficiency increased by 85% and complaint resolution time reduced by 70%. The platform scales beautifully with our growth.',
      rating: 5,
      avatar: '/avatars/01.png'
    },
    {
      name: 'Priya Sharma',
      role: 'Property Manager',
      company: 'Capital Heights',
      content:
        'Managing 2000+ residents used to be chaotic. Now with HSMS, everything is automated. The real-time dashboards give us complete visibility into operations.',
      rating: 5,
      avatar: '/avatars/02.png'
    },
    {
      name: 'Amit Patel',
      role: 'CEO',
      company: 'Urban Developers Group',
      content:
        'We manage 15+ societies with HSMS. The multi-society feature and API integrations saved us thousands of hours in manual work. Enterprise support is exceptional.',
      rating: 5,
      avatar: '/avatars/03.png'
    },
    {
      name: 'Neha Gupta',
      role: 'Operations Director',
      company: 'Metro Living',
      content:
        'The transition from legacy systems was seamless. Our staff loves the mobile app, and residents appreciate the transparency. ROI achieved in just 3 months.',
      rating: 5,
      avatar: '/avatars/04.png'
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex(
      prev => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

  return (
    <section className='py-20 bg-background'>
      <div className='container px-4 mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Badge variant='outline' className='mb-4'>
            <Star className='h-3.5 w-3.5 mr-2' />
            Customer Stories
          </Badge>

          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Trusted by Industry Leaders
          </h2>

          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            See how leading housing societies transformed their operations
          </p>
        </div>

        {/* Testimonial Card */}
        <div className='max-w-4xl mx-auto'>
          <Card className='shadow-xl'>
            <CardContent className='p-8'>
              {/* Content */}
              <div className='text-center'>
                {/* Rating */}
                <div className='flex justify-center gap-1 mb-4'>
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-5 w-5 fill-amber-400 text-amber-400'
                    />
                  ))}
                </div>

                <Quote className='h-8 w-8 text-primary/30 mx-auto mb-4' />

                <p className='text-lg italic text-muted-foreground mb-8 max-w-2xl mx-auto'>
                  &quot;{testimonials[currentIndex].content}&quot;
                </p>

                {/* User */}
                <div className='flex items-center justify-center gap-4'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={testimonials[currentIndex].avatar} />
                    <AvatarFallback>
                      {testimonials[currentIndex].name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className='text-left'>
                    <div className='font-semibold'>
                      {testimonials[currentIndex].name}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {testimonials[currentIndex].role},{' '}
                      {testimonials[currentIndex].company}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className='flex items-center justify-center gap-6 mt-10'>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={prevTestimonial}
                    className='h-10 w-10 rounded-full'
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>

                  <div className='flex gap-2'>
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                          index === currentIndex
                            ? 'bg-primary scale-125'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant='outline'
                    size='icon'
                    onClick={nextTestimonial}
                    className='h-10 w-10 rounded-full'
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mt-12'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>4.9/5</div>
              <div className='text-sm text-muted-foreground'>
                Average Rating
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>98%</div>
              <div className='text-sm text-muted-foreground'>
                Customer Satisfaction
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>500+</div>
              <div className='text-sm text-muted-foreground'>Societies</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>99.9%</div>
              <div className='text-sm text-muted-foreground'>Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
