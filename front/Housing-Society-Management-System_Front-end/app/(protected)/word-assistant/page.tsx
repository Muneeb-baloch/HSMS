'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  IconFileText,
  IconSpeakerphone,
  IconMail,
  IconFileInvoice,
  IconMessageCircle,
  IconArrowRight,
} from '@tabler/icons-react'
import Link from 'next/link'

const templates = [
  {
    title: 'Draft Announcement',
    description: 'Create society announcements, notices, and circulars with AI assistance',
    icon: IconSpeakerphone,
    href: '/ai/chat',
    prompt: 'announcement',
  },
  {
    title: 'Generate Notice',
    description: 'Defaulter notices, maintenance alerts, meeting invitations, and compliance letters',
    icon: IconFileText,
    href: '/ai/chat',
    prompt: 'notice',
  },
  {
    title: 'Compose Email',
    description: 'Professional emails to members, vendors, committee, or regulatory bodies',
    icon: IconMail,
    href: '/ai/chat',
    prompt: 'email',
  },
  {
    title: 'Financial Report',
    description: 'Monthly/quarterly financial summaries, budget reports, and audit narratives',
    icon: IconFileInvoice,
    href: '/ai/chat',
    prompt: 'report',
  },
  {
    title: 'Meeting Minutes',
    description: 'Structure and draft AGM minutes, committee meeting notes, and resolutions',
    icon: IconMessageCircle,
    href: '/ai/chat',
    prompt: 'minutes',
  },
]

export default function WordAssistantPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Word Assistant</h1>
        <p className='text-muted-foreground'>
          AI-powered writing tools for society management. Draft professional documents in seconds.
        </p>
      </div>

      {/* Quick start — go to AI chat */}
      <Card className='border-primary/20 bg-primary/5'>
        <CardContent className='flex items-center justify-between py-4'>
          <div>
            <p className='font-medium'>Start a free-form conversation</p>
            <p className='text-sm text-muted-foreground'>
              Ask the AI assistant anything — draft documents, get advice, or analyze data
            </p>
          </div>
          <Button asChild>
            <Link href='/ai/chat'>
              Open AI Chat
              <IconArrowRight className='ml-2 size-4' />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Templates */}
      <div>
        <h2 className='mb-4 text-lg font-semibold'>Document Templates</h2>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {templates.map(template => (
            <Link key={template.title} href={template.href}>
              <Card className='h-full transition-all hover:shadow-md hover:border-primary/30 cursor-pointer'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10'>
                      <template.icon className='size-5 text-primary' />
                    </div>
                    <CardTitle className='text-base'>{template.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{template.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Insights link */}
      <Card>
        <CardContent className='flex items-center justify-between py-4'>
          <div>
            <p className='font-medium'>AI Insights Dashboard</p>
            <p className='text-sm text-muted-foreground'>
              View AI-generated analytics, anomaly detection, and predictive insights
            </p>
          </div>
          <Button variant='outline' asChild>
            <Link href='/ai/insights'>
              View Insights
              <IconArrowRight className='ml-2 size-4' />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
