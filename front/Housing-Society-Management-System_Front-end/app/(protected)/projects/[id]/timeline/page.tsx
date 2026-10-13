// src/app/(dashboard)/projects/[id]/timeline/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useProject, useProjectTimeline } from '@/lib/hooks/entities/useProject'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  FileText,
  Flag,
  LucideIcon,
  MapPin,
  Plus,
  Printer,
  Target,
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  status: 'completed' | 'in-progress' | 'upcoming'
  type: 'milestone' | 'task' | 'meeting' | 'delivery'
  icon: LucideIcon
  color: string
  completedDate?: string
  assignedTo?: string
  attachments?: number
}

export default function ProjectTimelinePage () {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: timelineData, isLoading: timelineLoading } =
    useProjectTimeline(projectId)

  const [events, setEvents] = useState<TimelineEvent[]>([
  const { confirm } = useConfirm();
    {
      id: '1',
      title: 'Project Initiation',
      description: 'Project kickoff meeting and initial planning',
      date: '2024-01-01',
      status: 'completed',
      type: 'milestone',
      icon: Flag,
      color: 'bg-blue-500',
      completedDate: '2024-01-01',
      assignedTo: 'John Doe',
      attachments: 3
    },
    {
      id: '2',
      title: 'Land Acquisition',
      description: 'Finalize land purchase and registration',
      date: '2024-02-15',
      status: 'completed',
      type: 'milestone',
      icon: MapPin,
      color: 'bg-green-500',
      completedDate: '2024-02-20',
      assignedTo: 'Sarah Smith',
      attachments: 5
    },
    {
      id: '3',
      title: 'Design Approval',
      description: 'Architectural design review and approval',
      date: '2024-03-10',
      status: 'in-progress',
      type: 'task',
      icon: Target,
      color: 'bg-orange-500',
      assignedTo: 'Michael Chen',
      attachments: 2
    },
    {
      id: '4',
      title: 'Infrastructure Development',
      description: 'Roads, water, and electricity infrastructure',
      date: '2024-04-01',
      status: 'upcoming',
      type: 'milestone',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      id: '5',
      title: 'Plot Allocation',
      description: 'Initial plot allocation to investors',
      date: '2024-05-15',
      status: 'upcoming',
      type: 'task',
      icon: Users,
      color: 'bg-pink-500'
    },
    {
      id: '6',
      title: 'Project Completion',
      description: 'Final project completion and handover',
      date: '2024-12-31',
      status: 'upcoming',
      type: 'milestone',
      icon: CheckCircle2,
      color: 'bg-emerald-500'
    }
  ])

  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    type: 'task' as const,
    assignedTo: ''
  })
  const [showAddDialog, setShowAddDialog] = useState(false)

  const isLoading = projectLoading || timelineLoading

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!project) {
    return (
      <div className='p-6'>
        <div className='text-center py-12'>
          <Calendar className='h-12 w-12 mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-medium mb-2'>Project Not Found</h3>
          <p className='text-gray-500 mb-6'>
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/projects')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-orange-100 text-orange-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      case 'upcoming':
        return 'Upcoming'
      default:
        return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-purple-100 text-purple-800'
      case 'task':
        return 'bg-blue-100 text-blue-800'
      case 'meeting':
        return 'bg-orange-100 text-orange-800'
      case 'delivery':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return

    const event: TimelineEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      status: 'upcoming',
      type: newEvent.type,
      icon: Flag,
      color: 'bg-blue-500',
      assignedTo: newEvent.assignedTo || undefined
    }

    setEvents([...events, event])
    setNewEvent({
      title: '',
      description: '',
      date: '',
      type: 'task',
      assignedTo: ''
    })
    setShowAddDialog(false)
  }

  const handleDeleteEvent = async (id: string) => {
    if (await confirm({ title: "Delete", description: 'Are you sure you want to delete this event?', variant: "destructive" })) {
      setEvents(events.filter(event => event.id !== id))
    }
  }

  const handleUpdateStatus = (id: string, status: TimelineEvent['status']) => {
    setEvents(
      events.map(event => (event.id === id ? { ...event, status } : event))
    )
  }

  const completedEvents = events.filter(e => e.status === 'completed')
  const inProgressEvents = events.filter(e => e.status === 'in-progress')
  const upcomingEvents = events.filter(e => e.status === 'upcoming')

  const progressPercentage = Math.round(
    (completedEvents.length / events.length) * 100
  )

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push(`/projects/view/${projectId}`)}
          className='mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Project
        </Button>

        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>
              {project.projName} - Timeline
            </h1>
            <p className='text-gray-500 mt-2'>
              Track project progress and milestones
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => window.print()}>
              <Printer className='mr-2 h-4 w-4' />
              Print
            </Button>
            <Button variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                  <DialogTitle>Add Timeline Event</DialogTitle>
                  <DialogDescription>
                    Add a new event to the project timeline
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>Event Title</Label>
                    <Input
                      id='title'
                      value={newEvent.title ?? ''}
                      className='enhanced-input h-11'
                      onChange={e =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      placeholder='e.g., Design Review Meeting'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      value={newEvent.description}
                      onChange={e =>
                        setNewEvent({
                          ...newEvent,
                          description: e.target.value
                        })
                      }
                      placeholder='Event details'
                      rows={3}
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='date'>Date</Label>
                      <Input
                        id='date'
                        type='date'
                        value={newEvent.date ?? ''}
                        className='enhanced-input h-11'
                        onChange={e =>
                          setNewEvent({ ...newEvent, date: e.target.value })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='type'>Type</Label>
                      <select
                        id='type'
                        className='w-full px-3 py-2 border rounded-md'
                        value={newEvent.type}
                        onChange={e =>
                          setNewEvent({
                            ...newEvent,
                            type: e.target.value as any
                          })
                        }
                      >
                        <option value='task'>Task</option>
                        <option value='milestone'>Milestone</option>
                        <option value='meeting'>Meeting</option>
                        <option value='delivery'>Delivery</option>
                      </select>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='assignedTo'>Assigned To</Label>
                    <Input
                      id='assignedTo'
                      value={newEvent.assignedTo ?? ''}
                      className='enhanced-input h-11'
                      onChange={e =>
                        setNewEvent({
                          ...newEvent,
                          assignedTo: e.target.value
                        })
                      }
                      placeholder='Optional'
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setShowAddDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {events.length}
              </div>
              <div className='text-sm text-gray-600'>Total Events</div>
            </div>
            <div className='text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {completedEvents.length}
              </div>
              <div className='text-sm text-gray-600'>Completed</div>
            </div>
            <div className='text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg'>
              <div className='text-2xl font-bold text-orange-600'>
                {inProgressEvents.length}
              </div>
              <div className='text-sm text-gray-600'>In Progress</div>
            </div>
            <div className='text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg'>
              <div className='text-2xl font-bold text-purple-600'>
                {progressPercentage}%
              </div>
              <div className='text-sm text-gray-600'>Overall Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Timeline View */}
        <div className='lg:col-span-2'>
          <Card className='h-full'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Project Timeline
              </CardTitle>
              <CardDescription>
                Chronological view of all project events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='relative'>
                {/* Timeline line */}
                <div className='absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200'></div>

                {/* Timeline events */}
                <div className='space-y-8'>
                  {events
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                    .map((event, index) => {
                      const Icon = event.icon
                      const isCompleted = event.status === 'completed'
                      const isInProgress = event.status === 'in-progress'

                      return (
                        <div key={event.id} className='relative'>
                          {/* Timeline dot */}
                          <div
                            className={`absolute left-6 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white ${
                              isCompleted
                                ? 'bg-green-500'
                                : isInProgress
                                ? 'bg-orange-500'
                                : 'bg-blue-500'
                            }`}
                          ></div>

                          {/* Event card */}
                          <div
                            className={`ml-12 p-4 rounded-lg border ${
                              isCompleted
                                ? 'bg-green-50 border-green-200'
                                : isInProgress
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className='flex justify-between items-start mb-2'>
                              <div className='flex items-center gap-3'>
                                <div
                                  className={`p-2 rounded-full ${event.color}`}
                                >
                                  <Icon className='h-4 w-4 text-white' />
                                </div>
                                <div>
                                  <h3 className='font-semibold'>
                                    {event.title}
                                  </h3>
                                  <div className='flex items-center gap-2 mt-1'>
                                    <Badge className={getTypeColor(event.type)}>
                                      {getTypeText(event.type)}
                                    </Badge>
                                    <Badge
                                      className={getStatusColor(event.status)}
                                    >
                                      {getStatusText(event.status)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className='flex gap-1'>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </div>
                            </div>

                            <p className='text-gray-600 mb-3'>
                              {event.description}
                            </p>

                            <div className='flex justify-between items-center text-sm'>
                              <div className='flex items-center gap-4'>
                                <div className='flex items-center gap-1 text-gray-500'>
                                  <Calendar className='h-3 w-3' />
                                  {new Date(event.date).toLocaleDateString()}
                                </div>
                                {event.assignedTo && (
                                  <div className='flex items-center gap-1 text-gray-500'>
                                    <Users className='h-3 w-3' />
                                    {event.assignedTo}
                                  </div>
                                )}
                                {event.attachments && (
                                  <div className='flex items-center gap-1 text-gray-500'>
                                    <FileText className='h-3 w-3' />
                                    {event.attachments} files
                                  </div>
                                )}
                              </div>

                              <div className='flex gap-1'>
                                {event.status !== 'completed' && (
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() =>
                                      handleUpdateStatus(event.id, 'completed')
                                    }
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </div>

                            {isCompleted && event.completedDate && (
                              <div className='mt-2 text-sm text-green-600'>
                                <CheckCircle2 className='inline h-3 w-3 mr-1' />
                                Completed on{' '}
                                {new Date(
                                  event.completedDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className='space-y-6'>
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between mb-1'>
                    <span className='text-sm font-medium'>
                      Overall Progress
                    </span>
                    <span className='text-sm font-medium'>
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full'
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Completed Events</span>
                    <span className='text-sm font-medium'>
                      {completedEvents.length}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>In Progress</span>
                    <span className='text-sm font-medium'>
                      {inProgressEvents.length}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Upcoming</span>
                    <span className='text-sm font-medium'>
                      {upcomingEvents.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {upcomingEvents.slice(0, 3).map(event => {
                  const Icon = event.icon
                  return (
                    <div
                      key={event.id}
                      className='p-3 border rounded-lg hover:bg-gray-50 cursor-pointer'
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className='flex items-center gap-3'>
                        <div className={`p-2 rounded-full ${event.color}`}>
                          <Icon className='h-3 w-3 text-white' />
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>
                            {event.title}
                          </div>
                          <div className='text-xs text-gray-500 flex items-center gap-1 mt-1'>
                            <Calendar className='h-3 w-3' />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {upcomingEvents.length === 0 && (
                  <div className='text-center py-4 text-gray-500'>
                    <Clock className='h-8 w-8 mx-auto mb-2 opacity-50' />
                    <p className='text-sm'>No upcoming events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Completions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Recently Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {completedEvents.slice(0, 3).map(event => {
                  const Icon = event.icon
                  return (
                    <div
                      key={event.id}
                      className='p-3 border rounded-lg hover:bg-gray-50 cursor-pointer'
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className='flex items-center gap-3'>
                        <div className={`p-2 rounded-full ${event.color}`}>
                          <Icon className='h-3 w-3 text-white' />
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>
                            {event.title}
                          </div>
                          <div className='text-xs text-gray-500 flex items-center gap-1 mt-1'>
                            <CheckCircle2 className='h-3 w-3' />
                            {event.completedDate
                              ? new Date(
                                  event.completedDate
                                ).toLocaleDateString()
                              : 'Completed'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {completedEvents.length === 0 && (
                  <div className='text-center py-4 text-gray-500'>
                    <CheckCircle2 className='h-8 w-8 mx-auto mb-2 opacity-50' />
                    <p className='text-sm'>No completed events yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Detail Dialog */}
      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
        >
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                Event details and management
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className={`p-3 rounded-full ${selectedEvent.color}`}>
                  <selectedEvent.icon className='h-5 w-5 text-white' />
                </div>
                <div>
                  <div className='flex gap-2'>
                    <Badge className={getTypeColor(selectedEvent.type)}>
                      {getTypeText(selectedEvent.type)}
                    </Badge>
                    <Badge className={getStatusColor(selectedEvent.status)}>
                      {getStatusText(selectedEvent.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='font-medium mb-1'>Description</h4>
                <p className='text-gray-600'>{selectedEvent.description}</p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-medium mb-1'>Scheduled Date</h4>
                  <p className='text-gray-600'>
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </p>
                </div>
                {selectedEvent.completedDate && (
                  <div>
                    <h4 className='font-medium mb-1'>Completed Date</h4>
                    <p className='text-gray-600'>
                      {new Date(
                        selectedEvent.completedDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedEvent.assignedTo && (
                <div>
                  <h4 className='font-medium mb-1'>Assigned To</h4>
                  <p className='text-gray-600'>{selectedEvent.assignedTo}</p>
                </div>
              )}

              {selectedEvent.attachments && (
                <div>
                  <h4 className='font-medium mb-1'>Attachments</h4>
                  <p className='text-gray-600'>
                    {selectedEvent.attachments} file(s)
                  </p>
                </div>
              )}

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
                {selectedEvent.status !== 'completed' && (
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedEvent.id, 'completed')
                      setSelectedEvent(null)
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
