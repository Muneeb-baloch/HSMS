// src/lib/constants/srDevStatusForm.constants.tsx
import { FieldConfig } from '@/components/shared/EntityForm/EntityForm'
import { SrDevStatusFormData } from '@/lib/schemas/srDevStatus.schema'
import {
  DEFAULT_COLORS,
  DEV_CATEGORY_OPTIONS,
  DEV_PHASE_OPTIONS
} from './srDevStatus.constants'

export const srDevStatusFormFields: FieldConfig<SrDevStatusFormData>[] = [
  {
    name: 'srDevStatName',
    label: 'Development Status Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Site Clearing, Foundation Work, etc.'
  },
  {
    name: 'srDevStatCode',
    label: 'Status Code',
    type: 'text',
    required: true,
    placeholder: 'e.g., SITE_CLEARING, FOUNDATION, etc.'
  },
  {
    name: 'devCategory',
    label: 'Development Category',
    type: 'select',
    required: true,
    options: DEV_CATEGORY_OPTIONS
  },
  {
    name: 'devPhase',
    label: 'Development Phase',
    type: 'select',
    required: true,
    options: DEV_PHASE_OPTIONS
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe this development status...',
    rows: 3
  },
  {
    name: 'colorCode',
    label: 'Color',
    type: 'select',
    required: true,
    options: DEFAULT_COLORS.map(color => ({
      value: color.value,
      label: (
        <div className='flex items-center gap-2'>
          <div
            className='w-4 h-4 rounded-full border'
            style={{ backgroundColor: color.value }}
          />
          <span>{color.name}</span>
        </div>
      )
    }))
  },
  {
    name: 'isActive',
    label: 'Active Status',
    type: 'switch',
    defaultValue: true
  },
  {
    name: 'isDefault',
    label: 'Default Status',
    type: 'switch',
    defaultValue: false
  },
  {
    name: 'requiresDocumentation',
    label: 'Requires Documentation',
    type: 'switch',
    defaultValue: false
  },
  {
    name: 'icon',
    label: 'Icon Name',
    type: 'text',
    placeholder: 'e.g., wrench, building, check-circle'
  }
]
