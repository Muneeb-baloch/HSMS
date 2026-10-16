// src/components/shared/EntityForm/EntityForm.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReactNode, useEffect } from 'react'
import { DefaultValues, FieldValues, Path, useForm } from 'react-hook-form'
import * as z from 'zod'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { DatePicker } from '@/components/ui/date-picker'
import { useAuth } from '@/lib/hooks/useAuth'
import { EntityType } from '@/lib/types/upload.types'
import { Loader2 } from 'lucide-react'
import { FileUpload } from '../FileUpload/FileUpload'
import { ImageUpload } from '../ImageUpload/ImageUpload'
import { SearchableSelect } from '../SearchableSelect/SearchableSelect'
import { StateCitySelect } from '../StateCitySelect/StateCitySelect'
export type SelectOption = {
  label: ReactNode
  value: string | number
}

export interface FieldConfig<TFormData extends FieldValues> {
  name: Path<TFormData>
  label: string
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'switch'
    | 'date'
    | 'relationship'
    | 'state-city'
    | 'image-upload'
    | 'file-upload'

  required?: boolean
  placeholder?: string
  description?: string
  disabled?: boolean // number input
  mask?: string
  prefix?: string
  defaultValue?: unknown
  rows?: number // textarea
  min?: number | Date | string // Add Date and string for date fields
  max?: number | Date | string // Add Date and string for date fields
  step?: number // conditional visibility
  showWhen?: (values: TFormData) => boolean
  dependsOn?: Path<TFormData>
  // ✅ FIXED
  getOptions?: (values: TFormData) => SelectOption[]

  options?: SelectOption[]
  /** Span both grid columns - use for fields taller than a normal input (e.g. nested state/city selects) to avoid an empty gap next to a shorter field in the same row. */
  fullWidth?: boolean
  // ✅ ADD THIS (your forms already want it)
  onChange?: (
    value: unknown,
    form: ReturnType<typeof useForm<TFormData>>
  ) => void
  relationship?: {
    endpoint: string | ((values: TFormData) => string)
    labelField: string | ((values: TFormData) => string)
    valueField: string
    searchable?: boolean
    filter?: (item: unknown) => boolean
    /** Field on each item to show as secondary/muted text under the label (e.g. a role) */
    secondaryField?: string

    onCreate?: (data: unknown) => Promise<unknown>
    queryParams?:
      | Record<string, unknown>
      | ((values: TFormData) => Record<string, unknown>)
  }
  uploadConfig?: {
    // Add this property
    entityType: EntityType
    entityId: string
    maxSize?: number
    aspectRatio?: 'square' | 'video' | 'custom'
    acceptedFileTypes?: string[]
    allowMultipleTypes?: boolean
  }
  validation?: z.ZodTypeAny
}

// Change the EntityFormProps interface:
interface EntityFormProps<TFormData extends FieldValues> {
  schema: z.ZodTypeAny
  fields: FieldConfig<TFormData>[]
  defaultValues?: DefaultValues<TFormData>
  onSubmit: (data: TFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
  cancelLabel?: string
  onImageUpload?: (url: string, fieldName: string) => void
  /** Wrap form in a glassmorphism card (backdrop-blur, border, rounded-xl) */
  glassCard?: boolean
  /** Pre-loaded labels for relationship fields when editing (e.g. from populated API response) */
  initialRelationshipOptions?: Record<string, { value: string; label: string }>
}

export function EntityForm<TFormData extends FieldValues> ({
  schema,
  fields,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onImageUpload,
  glassCard = false,
  initialRelationshipOptions
}: EntityFormProps<TFormData>) {
  type FormData = TFormData
  const { user } = useAuth()

  const form = useForm<FormData>({
    // @ts-expect-error - Zod v4 schema compatibility with react-hook-form
    resolver: zodResolver(schema),
    defaultValues
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues as FormData)
    }
  }, [defaultValues, form])

  // Build map of dependent fields
  const dependentFieldMap = fields
    .filter(f => f.dependsOn)
    .reduce((acc, f) => {
      const depOn = f.dependsOn as string
      if (!acc[depOn]) acc[depOn] = []
      acc[depOn].push(f.name as string)
      return acc
    }, {} as Record<string, string[]>)

  // Watch only parent fields and clear dependents when they change
  useEffect(() => {
    if (Object.keys(dependentFieldMap).length === 0) return

    const parentFields = Object.keys(dependentFieldMap) as Path<TFormData>[]
    const subscription = form.watch((values, { name }) => {
      // Only clear if a parent field changed
      if (name && parentFields.includes(name as Path<TFormData>)) {
        const dependents = dependentFieldMap[name] || []
        dependents.forEach(dependent => {
          form.setValue(dependent as Path<TFormData>, '' as any)
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, dependentFieldMap])

  const renderField = (fieldConfig: FieldConfig<TFormData>) => {
    const { name, type } = fieldConfig

    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number': {
        const inputFocusRing =
          'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900'
        return (
          <FormField
            key={name as Path<TFormData>}
            control={form.control}
            name={name as Path<TFormData>}
            render={({ field }) => {
              const raw = field.value as unknown
              const displayValue =
                raw === undefined ||
                raw === null ||
                (typeof raw === 'number' && Number.isNaN(raw))
                  ? ''
                  : String(raw)
              const fieldError = (name as string)
                .split('.')
                .reduce(
                  (o: unknown, k) =>
                    o != null && typeof o === 'object'
                      ? (o as Record<string, unknown>)[k]
                      : undefined,
                  form.formState.errors as object
                )
              const hasError =
                fieldError != null &&
                typeof fieldError === 'object' &&
                'message' in fieldError

              const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value
                if (type === 'number') {
                  if (val === '') return field.onChange('')
                  const n = Number(val)
                  return Number.isNaN(n)
                    ? field.onChange(val)
                    : field.onChange(n)
                }
                return field.onChange(val)
              }

              return (
                <FormItem
                  className={hasError ? 'animate-form-shake' : undefined}
                >
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    {type === 'number' && fieldConfig.prefix ? (
                      <div className='flex'>
                        <span className='inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm'>
                          {fieldConfig.prefix}
                        </span>
                        <Input
                          type={type}
                          placeholder={fieldConfig.placeholder}
                          disabled={fieldConfig.disabled || isLoading}
                          value={displayValue}
                          onChange={handleChange}
                          className={`enhanced-input h-11 rounded-l-none ${inputFocusRing}`}
                        />
                      </div>
                    ) : (
                      <Input
                        type={type}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled || isLoading}
                        value={displayValue}
                        onChange={handleChange}
                        className={`enhanced-input h-11 ${inputFocusRing}`}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        )
      }

      case 'textarea':
        return (
          <FormField
            key={name as Path<TFormData>}
            control={form.control}
            name={name as Path<TFormData>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required && (
                    <span className='text-red-500 ml-1'>*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Textarea
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={(field.value as string) ?? ''}
                    placeholder={fieldConfig.placeholder}
                    disabled={fieldConfig.disabled || isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'image-upload':
        return (
          <FormField
            key={name as Path<TFormData>}
            control={form.control}
            name={name as Path<TFormData>}
            render={({ field }) => {
              const handleImageChange = (url: string) => {
                field.onChange(url)
                if (onImageUpload) {
                  onImageUpload(url, name as string)
                }
              }

              // If no uploadConfig is provided, show a regular input
              if (!fieldConfig.uploadConfig) {
                return (
                  <FormItem>
                    <FormLabel>
                      {fieldConfig.label}
                      {fieldConfig.required && (
                        <span className='text-red-500 ml-1'>*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter image URL or upload using the image upload component'
                        value={(field.value as string) ?? ''}
                        onChange={field.onChange}
                        disabled={fieldConfig.disabled || isLoading}
                        className='enhanced-input h-11'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }

              return (
                <FormItem>
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value as string}
                      onChange={handleImageChange}
                      disabled={fieldConfig.disabled || isLoading}
                      entityType={fieldConfig.uploadConfig.entityType}
                      entityId={fieldConfig.uploadConfig.entityId}
                      uploadedBy={user?.id || user?.email || 'unknown'}
                      maxSize={fieldConfig.uploadConfig.maxSize}
                      aspectRatio={fieldConfig.uploadConfig.aspectRatio}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        )
      case 'file-upload':
        return (
          <FormField
            key={name as Path<TFormData>}
            control={form.control}
            name={name as Path<TFormData>}
            render={({ field }) => {
              const handleFileChange = (url: string) => {
                field.onChange(url)
                if (onImageUpload) {
                  onImageUpload(url, name as string)
                }
              }

              // If no uploadConfig is provided, show a regular input
              if (!fieldConfig.uploadConfig) {
                return (
                  <FormItem>
                    <FormLabel>
                      {fieldConfig.label}
                      {fieldConfig.required && (
                        <span className='text-red-500 ml-1'>*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter file URL or upload using the file upload component'
                        value={(field.value as string) ?? ''}
                        onChange={field.onChange}
                        disabled={fieldConfig.disabled || isLoading}
                        className='enhanced-input h-11'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }

              return (
                <FormItem>
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value as string}
                      onChange={handleFileChange}
                      disabled={fieldConfig.disabled || isLoading}
                      entityType={fieldConfig.uploadConfig.entityType}
                      entityId={fieldConfig.uploadConfig.entityId}
                      uploadedBy={user?.id || user?.email || 'unknown'}
                      maxSize={fieldConfig.uploadConfig.maxSize}
                      acceptedFileTypes={
                        fieldConfig.uploadConfig.acceptedFileTypes
                      }
                      allowMultipleTypes={
                        fieldConfig.uploadConfig.allowMultipleTypes
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        )
      case 'select':
        return (
          <FormField
            key={name as Path<TFormData>}
            control={form.control}
            name={name as Path<TFormData>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required && (
                    <span className='text-red-500 ml-1'>*</span>
                  )}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={fieldConfig.disabled || isLoading}
                >
                  <FormControl>
                    <SelectTrigger className='h-11 enhanced-input'>
                      <SelectValue
                        placeholder={
                          fieldConfig.placeholder ||
                          `Select ${fieldConfig.label}`
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fieldConfig.options
                      ?.filter(
                        option =>
                          option.value !== '' && option.value !== undefined
                      )
                      .map(option => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'switch':
        return (
          <FormField
            key={name as Path<TFormData>}
            control={form.control}
            name={name as Path<TFormData>}
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>
                    {fieldConfig.label}
                    {fieldConfig.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                    disabled={fieldConfig.disabled || isLoading}
                    className='data-[state=checked]:bg-primary'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'date': {
        const toDate = (v: unknown): Date | undefined => {
          if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v
          if (typeof v === 'string') {
            const d = new Date(v)
            return isNaN(d.getTime()) ? undefined : d
          }
          return undefined
        }
        return (
          <FormField
            key={name as Path<TFormData>}
            control={form.control}
            name={name as Path<TFormData>}
            render={({ field }) => {
              const value =
                typeof field.value === 'string'
                  ? field.value
                  : (field.value as string) || ''
              const fieldError = (name as string)
                .split('.')
                .reduce(
                  (o: unknown, k) =>
                    o != null && typeof o === 'object'
                      ? (o as Record<string, unknown>)[k]
                      : undefined,
                  form.formState.errors as object
                )
              return (
                <FormItem
                  className={
                    fieldError != null &&
                    typeof fieldError === 'object' &&
                    'message' in fieldError
                      ? 'animate-form-shake'
                      : undefined
                  }
                >
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={value || undefined}
                      onChange={v => field.onChange(v)}
                      placeholder={fieldConfig.placeholder ?? 'Select date'}
                      disabled={fieldConfig.disabled || isLoading}
                      min={
                        fieldConfig.min != null
                          ? toDate(fieldConfig.min)
                          : undefined
                      }
                      max={
                        fieldConfig.max != null
                          ? toDate(fieldConfig.max)
                          : undefined
                      }
                      inputClassName='enhanced-input h-11 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        )
      }
      case 'state-city':
        return (
          <FormField
            key={name as Path<TFormData>}
            control={form.control}
            name={name as Path<TFormData>}
            render={({ field }) => {
              const fieldError = (name as string)
                .split('.')
                .reduce(
                  (o: unknown, k) =>
                    o != null && typeof o === 'object'
                      ? (o as Record<string, unknown>)[k]
                      : undefined,
                  form.formState.errors as object
                )
              const errorMsg =
                fieldError != null &&
                typeof fieldError === 'object' &&
                'message' in fieldError
                  ? String((fieldError as { message?: unknown }).message)
                  : undefined
              return (
                <FormItem>
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <StateCitySelect
                      value={(field.value as string) ?? ''}
                      onChange={field.onChange}
                      disabled={fieldConfig.disabled || isLoading}
                      required={fieldConfig.required}
                      error={errorMsg}
                      initialCityId={
                        defaultValues?.[name as keyof TFormData] as
                          | string
                          | undefined
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        )
      case 'relationship': {
        const dependsOnField = fieldConfig.dependsOn
        return (
          <FormField
            key={name as Path<TFormData>}
            control={form.control}
            name={name as Path<TFormData>}
            render={({ field }) => {
              const relationship = fieldConfig.relationship!
              const currentValues = form.getValues()
              const endpoint =
                typeof relationship.endpoint === 'function'
                  ? relationship.endpoint(currentValues)
                  : relationship.endpoint
              const labelField =
                typeof relationship.labelField === 'function'
                  ? relationship.labelField(currentValues)
                  : relationship.labelField

              const computedQueryParams =
                typeof relationship.queryParams === 'function'
                  ? relationship.queryParams(currentValues)
                  : relationship.queryParams

              return (
                <FormItem>
                  <FormLabel>
                    {fieldConfig.label}
                    {fieldConfig.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <SearchableSelect
                      key={dependsOnField ? JSON.stringify(computedQueryParams) : name as string}
                      value={(field.value as string) ?? ''}
                      onValueChange={val => {
                        field.onChange(val)
                        fieldConfig.onChange?.(val, form)
                      }}
                      endpoint={endpoint}
                      labelField={labelField}
                      valueField={relationship.valueField}
                      secondaryField={relationship.secondaryField}
                      placeholder={fieldConfig.placeholder}
                      disabled={fieldConfig.disabled || isLoading}
                      onCreate={relationship.onCreate}
                      queryParams={computedQueryParams}
                      initialOption={initialRelationshipOptions?.[name as string]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        )
      }

      default:
        return null
    }
  }

  const formContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 min-w-0'>
      {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {fields.map(field => renderField(field))}
        </div> */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 min-w-0'>
        {fields.map(field => {
          const fieldElement = renderField(field)
          return fieldElement ? (
            <div
              key={field.name as string}
              className={`animate-fade-in-up min-w-0${field.fullWidth ? ' md:col-span-2' : ''}`}
              style={{ animationDelay: `${fields.indexOf(field) * 50}ms` }}
            >
              {fieldElement}
            </div>
          ) : null
        })}
      </div>

      {/* <div className='flex justify-end space-x-4'>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button type='submit' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {submitLabel}
          </Button>
        </div> */}
      <div className='flex justify-end gap-3 pt-6 border-t border-border'>
        {onCancel && (
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
            className='enhanced-button px-6 border-white/10 hover:border-primary/30 hover:bg-primary/5'
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type='submit'
          disabled={isLoading}
          className='enhanced-button hover-lift px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg border-0'
        >
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )

  return (
    <Form {...form}>
      {glassCard ? (
        <div className='rounded-xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl'>
          {formContent}
        </div>
      ) : (
        formContent
      )}
    </Form>
  )
}
