'use client'

import {
  EntityForm,
  FieldConfig
} from '@/components/shared/EntityForm/EntityForm'
import { z } from 'zod'

const rewardSchema = z.object({
  rewardName: z.string().min(1, 'Reward name is required'),
  description: z.string().optional(),
  pointsCost: z.coerce.number().min(1, 'Points cost must be at least 1'),
  quantity: z.coerce.number().default(-1),
  rewardType: z.string().min(1, 'Reward type is required'),
  validUntil: z.string().optional()
})

type RewardFormData = z.infer<typeof rewardSchema>

const rewardFormFields: FieldConfig<RewardFormData>[] = [
  {
    name: 'rewardName',
    label: 'Reward Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., 10% Maintenance Discount'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Describe what this reward offers',
    rows: 3
  },
  {
    name: 'pointsCost',
    label: 'Points Cost',
    type: 'number',
    required: true,
    min: 1,
    placeholder: 'e.g., 500'
  },
  {
    name: 'quantity',
    label: 'Quantity (-1 for unlimited)',
    type: 'number',
    required: false,
    placeholder: '-1',
    defaultValue: -1
  },
  {
    name: 'rewardType',
    label: 'Reward Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Discount', value: 'discount' },
      { label: 'Free Booking', value: 'free-booking' },
      { label: 'Merchandise', value: 'merchandise' },
      { label: 'Recognition', value: 'recognition' },
      { label: 'Donation', value: 'donation' }
    ]
  },
  {
    name: 'validUntil',
    label: 'Valid Until',
    type: 'date',
    required: false,
    placeholder: 'Select expiry date (optional)'
  }
]

interface RewardFormProps {
  mode: 'create' | 'edit'
  onSubmit: (data: RewardFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<RewardFormData>
}

export { rewardSchema, rewardFormFields }
export type { RewardFormData }

export default function RewardForm ({
  mode,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues
}: RewardFormProps) {
  return (
    <EntityForm
      schema={rewardSchema}
      fields={rewardFormFields}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={mode === 'create' ? 'Create Reward' : 'Save Changes'}
      cancelLabel='Cancel'
      isLoading={isLoading}
    />
  )
}
