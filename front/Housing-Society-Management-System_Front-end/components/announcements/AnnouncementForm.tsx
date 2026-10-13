'use client'

import { FilePreview } from '@/components/FilePreview'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  useAnnouncementApi,
  type TargetType
} from '@/lib/hooks/useAnnouncementApi'
import { useAppSelector } from '@/lib/store/hooks'
import type { AnnouncementCategory } from '@/lib/types/announcementCategory'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { customToast } from "@/lib/utils/customToast"
import { z } from 'zod'

const announcementFormSchema = z
  .object({
    title: z.string().min(3, 'Title is required').max(200),
    description: z.string().min(10, 'Description is required').max(5000),
    categoryId: z.string().min(1, 'Category is required'),
    priorityLevel: z.coerce.number().int().min(1).max(3),
    expiresAt: z.string().optional(),
    targetType: z.enum(['All', 'Block', 'Project', 'Individual']),
    targetGroupId: z.string().optional()
  })
  .superRefine((values, ctx) => {
    if (values.targetType !== 'All' && !values.targetGroupId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['targetGroupId'],
        message: 'Target group is required'
      })
    }

    if (values.expiresAt && Number.isNaN(Date.parse(values.expiresAt))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiresAt'],
        message: 'Expiry date is invalid'
      })
    }

    if (values.expiresAt) {
      const chosenDate = new Date(values.expiresAt)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (chosenDate <= today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['expiresAt'],
          message: 'Expiry date must be in the future'
        })
      }
    }
  })

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>

const priorityOptions = [
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'High / Urgent' }
]

const targetOptions = [
  { value: 'All', label: 'All Users' },
  { value: 'Block', label: 'Specific Block' },
  { value: 'Project', label: 'Specific Project' },
  { value: 'Individual', label: 'Specific Individual' }
]

const getStoredUserId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined
  const raw = localStorage.getItem('user')
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as {
      userId?: string
      id?: string
      _id?: string
    }
    return parsed.userId || parsed.id || parsed._id
  } catch {
    return undefined
  }
}

export function AnnouncementForm () {
  const { fetchCategories, fetchTargetGroups, createAnnouncement, isLoading } =
    useAnnouncementApi()
  const user = useAppSelector(state => state.auth.user)

  // Get tomorrow's date in YYYY-MM-DD format for min date validation
  const tomorrow = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
  }, [])

  const [categories, setCategories] = useState<AnnouncementCategory[]>([])
  const [targetGroups, setTargetGroups] = useState<
    { id: string; label: string }[]
  >([])
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [authorId, setAuthorId] = useState<string | undefined>(undefined)

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      priorityLevel: 2,
      expiresAt: '',
      targetType: 'All',
      targetGroupId: ''
    }
  })

  const targetType = form.watch('targetType') as TargetType
  const isSubmitting = form.formState.isSubmitting || isLoading.create

  useEffect(() => {
    // Priority: Redux user state -> localStorage
    const userId =
      (user as { userId?: string; id?: string; _id?: string } | null)?.userId ||
      (user as { id?: string; _id?: string } | null)?.id ||
      (user as { _id?: string } | null)?._id ||
      getStoredUserId()
    setAuthorId(userId)
  }, [user])

  // Fallback: Load from localStorage on mount if Redux user is not available
  useEffect(() => {
    if (!authorId) {
      const storedUserId = getStoredUserId()
      if (storedUserId) {
        setAuthorId(storedUserId)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const data = await fetchCategories()
        if (isMounted) setCategories(data)
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load categories'
        customToast.error(message)
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [fetchCategories])

  useEffect(() => {
    let isMounted = true
    form.setValue('targetGroupId', '')

    const loadTargets = async () => {
      if (targetType === 'All') {
        setTargetGroups([])
        return
      }

      try {
        const data = await fetchTargetGroups(targetType)
        if (isMounted) setTargetGroups(data)
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load target groups'
        customToast.error(message)
      }
    }

    loadTargets()

    return () => {
      isMounted = false
    }
  }, [fetchTargetGroups, form, targetType])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isValidType =
      file.type.startsWith('image/') || file.type === 'application/pdf'
    if (!isValidType) {
      customToast.error('Only PDF or image files are allowed')
      return
    }

    setAttachmentFile(file)
  }

  const handleRemoveFile = () => {
    setAttachmentFile(null)
  }

  const onSubmit = async (values: AnnouncementFormValues) => {
    if (!authorId) {
      console.error('❌ No authorId found:', {
        user,
        authorId,
        localStorage: getStoredUserId()
      })
      customToast.error(
        'Unable to identify the author. Please refresh the page or sign in again.'
      )
      return
    }

    try {
      await createAnnouncement(
        {
          authorId,
          categoryId: values.categoryId,
          title: values.title,
          announcementDesc: values.description,
          targetType: values.targetType,
          targetGroupId:
            values.targetType === 'All' ? undefined : values.targetGroupId,
          priorityLevel: values.priorityLevel,
          expiresAt: values.expiresAt || undefined
        },
        attachmentFile ?? undefined,
        authorId
      )

      form.reset()
      setAttachmentFile(null)
      customToast.success('Announcement created successfully')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create announcement'
      customToast.error(message)
    }
  }

  const categoryOptions = useMemo(() => {
    return categories.map(category => ({
      value: category._id,
      label: category.categoryName
    }))
  }, [categories])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='Announcement title' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormDescription>Optional - leave empty for no expiry</FormDescription>
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder='Write the announcement details'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='categoryId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue
                        placeholder={
                          isLoading.categories
                            ? 'Loading categories...'
                            : 'Select category'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='priorityLevel'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ? String(field.value) : ''}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select priority' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='expiresAt'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input type='date' min={tomorrow} {...field} />
              </FormControl>
              <FormDescription>
                Optional — leave empty for no expiry
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='targetType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select target type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {targetOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='targetGroupId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Group</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
                disabled={targetType === 'All' || isLoading.targets}
              >
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue
                      placeholder={
                        targetType === 'All'
                          ? 'Disabled for All users'
                          : isLoading.targets
                          ? 'Loading targets...'
                          : 'Select target group'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {targetGroups.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Attachment</FormLabel>
          <div className='space-y-3'>
            <label className='flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground hover:border-primary'>
              <Input
                type='file'
                accept='image/*,.pdf'
                className='hidden'
                onChange={handleFileChange}
              />
              <Upload className='h-4 w-4' />
              <span>Upload PDF or image</span>
            </label>

            {attachmentFile && (
              <div className='space-y-2'>
                <FilePreview file={attachmentFile} showActions={false} />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleRemoveFile}
                >
                  <X className='h-4 w-4' />
                  Remove file
                </Button>
              </div>
            )}
          </div>
        </FormItem>

        <Button
          type='submit'
          disabled={isSubmitting || !authorId}
          className='w-full'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Creating...
            </>
          ) : !authorId ? (
            'Loading user...'
          ) : (
            'Create Announcement'
          )}
        </Button>
      </form>
    </Form>
  )
}
