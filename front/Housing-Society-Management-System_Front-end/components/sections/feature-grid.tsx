// components/sections/feature-grid.tsx
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart3,
  Bell,
  Cloud,
  Database,
  FileText,
  Globe,
  Lock,
  MessageSquare,
  Shield,
  Smartphone,
  Tablet,
  Users,
  Zap
} from 'lucide-react'

interface FeatureGridProps {
  activeTab: string
}

export function FeatureGrid ({ activeTab }: FeatureGridProps) {
  const managementFeatures = [
    {
      icon: Database,
      title: 'Centralized Database',
      description: 'Single source of truth for all society data',
      badge: 'Core'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time insights with custom dashboards',
      badge: 'Pro'
    },
    {
      icon: Shield,
      title: 'Role-based Access',
      description: 'Granular permissions for staff and admin',
      badge: 'Security'
    },
    {
      icon: FileText,
      title: 'Automated Reporting',
      description: 'Generate compliance and financial reports',
      badge: 'Compliance'
    },
    {
      icon: Globe,
      title: 'Multi-society Management',
      description: 'Manage multiple societies from one dashboard',
      badge: 'Enterprise'
    },
    {
      icon: Cloud,
      title: 'Cloud Infrastructure',
      description: 'Scalable, secure, and reliable hosting',
      badge: 'Infra'
    }
  ]

  const residentFeatures = [
    {
      icon: Smartphone,
      title: 'Mobile Payments',
      description: 'Pay maintenance dues with one click',
      badge: 'Convenience'
    },
    {
      icon: MessageSquare,
      title: 'Complaint Tracking',
      description: 'Real-time status updates on maintenance requests',
      badge: 'Transparency'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Instant alerts for announcements and updates',
      badge: 'Communication'
    },
    {
      icon: Users,
      title: 'Community Directory',
      description: 'Connect with neighbors securely',
      badge: 'Social'
    },
    {
      icon: FileText,
      title: 'Digital Receipts',
      description: 'Access payment history anytime',
      badge: 'Records'
    },
    {
      icon: Shield,
      title: 'Secure Messaging',
      description: 'Encrypted communication with management',
      badge: 'Privacy'
    }
  ]

  const staffFeatures = [
    {
      icon: Tablet,
      title: 'Field Operations',
      description: 'Mobile task management for on-site staff',
      badge: 'Mobile'
    },
    {
      icon: Zap,
      title: 'Work Order Automation',
      description: 'Automated assignment and tracking',
      badge: 'Efficiency'
    },
    {
      icon: BarChart3,
      title: 'Performance Metrics',
      description: 'Track staff productivity and response times',
      badge: 'Analytics'
    },
    {
      icon: Bell,
      title: 'Shift Management',
      description: 'Schedule and manage staff shifts',
      badge: 'Scheduling'
    },
    {
      icon: MessageSquare,
      title: 'Internal Communication',
      description: 'Team chat and collaboration tools',
      badge: 'Collaboration'
    },
    {
      icon: Lock,
      title: 'Attendance Tracking',
      description: 'Biometric and GPS-based attendance',
      badge: 'Security'
    }
  ]

  const features =
    activeTab === 'management'
      ? managementFeatures
      : activeTab === 'resident'
      ? residentFeatures
      : staffFeatures

  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {features.map(feature => {
        const Icon = feature.icon
        return (
          <Card
            key={feature.title}
            className='group border hover:border-primary/50 transition-all hover:shadow-lg'
          >
            <CardHeader>
              <div className='flex items-start justify-between mb-4'>
                <div className='p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors'>
                  <Icon className='h-6 w-6 text-primary' />
                </div>
                <Badge variant='secondary' className='text-xs'>
                  {feature.badge}
                </Badge>
              </div>
              <CardTitle className='text-lg'>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                {feature.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
