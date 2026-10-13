'use client'

import {
  EntityForm,
  FieldConfig
} from '@/components/shared/EntityForm/EntityForm'
import { z } from 'zod'

const geofenceSchema = z.object({
  name: z.string().min(1, 'Geofence name is required'),
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  radius: z.coerce.number().min(10, 'Radius must be at least 10 meters').default(100)
})

type GeofenceFormData = z.infer<typeof geofenceSchema>

const geofenceFormFields: FieldConfig<GeofenceFormData>[] = [
  {
    name: 'name',
    label: 'Geofence Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Main Office, Society Gate'
  },
  {
    name: 'latitude',
    label: 'Latitude',
    type: 'number',
    required: true,
    placeholder: 'e.g., 24.8607',
    step: 0.000001,
    min: -90,
    max: 90
  },
  {
    name: 'longitude',
    label: 'Longitude',
    type: 'number',
    required: true,
    placeholder: 'e.g., 67.0011',
    step: 0.000001,
    min: -180,
    max: 180
  },
  {
    name: 'radius',
    label: 'Radius (meters)',
    type: 'number',
    required: true,
    placeholder: '100',
    min: 10,
    defaultValue: 100
  }
]

interface GeofenceFormProps {
  mode: 'create' | 'edit'
  onSubmit: (data: GeofenceFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<GeofenceFormData>
}

export { geofenceSchema, geofenceFormFields }
export type { GeofenceFormData }

export default function GeofenceForm ({
  mode,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues
}: GeofenceFormProps) {
  return (
    <EntityForm
      schema={geofenceSchema}
      fields={geofenceFormFields}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={mode === 'create' ? 'Create Geofence' : 'Save Changes'}
      cancelLabel='Cancel'
      isLoading={isLoading}
    />
  )
}
