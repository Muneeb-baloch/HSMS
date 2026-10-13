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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { GenerateCertificateDto, UpdateCertificateDto } from '@/lib/types/plra'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface CertificateFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<UpdateCertificateDto>
  onSubmit: (values: GenerateCertificateDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const CERTIFICATE_TYPES = [
  { value: 'ownership', label: 'Ownership' },
  { value: 'allotment', label: 'Allotment' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'possession', label: 'Possession' }
]

const AREA_UNITS = [
  { value: 'marla', label: 'Marla' },
  { value: 'kanal', label: 'Kanal' },
  { value: 'sqft', label: 'Square Feet' },
  { value: 'sqm', label: 'Square Meters' }
]

export default function CertificateForm ({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false
}: CertificateFormProps) {
  const form = useForm<GenerateCertificateDto>({
    defaultValues: {
      plotId: defaultValues?.plotId || '',
      memberId: defaultValues?.memberId || '',
      societyId: defaultValues?.societyId || '',
      certificateType: defaultValues?.certificateType || 'ownership',
      propertyDetails: {
        area: defaultValues?.propertyDetails?.area || 0,
        areaUnit: defaultValues?.propertyDetails?.areaUnit || 'marla',
        boundaries: defaultValues?.propertyDetails?.boundaries || '',
        address: defaultValues?.propertyDetails?.address || '',
        plotNumber: defaultValues?.propertyDetails?.plotNumber || '',
        blockName: defaultValues?.propertyDetails?.blockName || ''
      },
      ownerDetails: {
        name: defaultValues?.ownerDetails?.name || '',
        cnic: defaultValues?.ownerDetails?.cnic || '',
        fatherName: defaultValues?.ownerDetails?.fatherName || '',
        address: defaultValues?.ownerDetails?.address || ''
      }
    }
  })

  const handleFormSubmit = async (values: GenerateCertificateDto) => {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-8'
      >
        {/* Certificate Info */}
        <div>
          <h3 className='text-lg font-semibold mb-4 border-b border-border pb-2'>
            Certificate Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='certificateType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Certificate Type <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className='h-11 enhanced-input'>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CERTIFICATE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name='plotId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Plot ID <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter plot ID or search'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='memberId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Member ID <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter member ID'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='societyId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Society ID <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter society ID'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Property Details */}
        <div>
          <h3 className='text-lg font-semibold mb-4 border-b border-border pb-2'>
            Property Details
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='propertyDetails.plotNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Plot Number <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. 123'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='propertyDetails.blockName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Block Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. Block A'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='propertyDetails.area'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Area <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='e.g. 10'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      value={field.value || ''}
                      onChange={e => {
                        const val = e.target.value
                        field.onChange(val === '' ? 0 : Number(val))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='propertyDetails.areaUnit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Area Unit <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className='h-11 enhanced-input'>
                        <SelectValue placeholder='Select unit' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AREA_UNITS.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
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
              name='propertyDetails.address'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel>
                    Property Address <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter property address'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='propertyDetails.boundaries'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel>Boundaries</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe property boundaries (North, South, East, West)'
                      disabled={isLoading}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Owner Details */}
        <div>
          <h3 className='text-lg font-semibold mb-4 border-b border-border pb-2'>
            Owner Details
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='ownerDetails.name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Owner Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Full name'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ownerDetails.cnic'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    CNIC <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='XXXXX-XXXXXXX-X'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ownerDetails.fatherName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Father&apos;s Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Father's full name"
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ownerDetails.address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Owner Address <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Residential address'
                      disabled={isLoading}
                      className='enhanced-input h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3 pt-6 border-t border-border'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
            className='enhanced-button px-6 border-white/10 hover:border-primary/30 hover:bg-primary/5'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isLoading}
            className='enhanced-button hover-lift px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg border-0'
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {mode === 'create' ? 'Generate Certificate' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
