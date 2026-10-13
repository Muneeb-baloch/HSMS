// src/lib/constants/salesStatusForm.constants.ts
import { FieldConfig } from '@/components/shared/EntityForm/EntityForm'
import { SalesStatusFormData } from '@/lib/schemas/salesStatus.schema'
import {
  DEFAULT_COLORS,
  SEQUENCE_OPTIONS,
  STATUS_TYPE_OPTIONS
} from './salesStatus.constants'

export const salesStatusFormFields: FieldConfig<SalesStatusFormData>[] = [
  {
    name: 'statusName',
    label: 'Status Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Available for Sale'
  },
  {
    name: 'statusCode',
    label: 'Status Code',
    type: 'text',
    required: true,
    placeholder: 'e.g., AVAILABLE'
  },
  {
    name: 'statusType',
    label: 'Status Type',
    type: 'select',
    required: true,
    options: STATUS_TYPE_OPTIONS
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe this status...',
    rows: 3
  },
  {
    name: 'colorCode',
    label: 'Color',
    type: 'select',
    required: true,
    options: DEFAULT_COLORS.map(color => ({
      value: color.value,
      label: color.name
    }))
  },
  {
    name: 'sequence',
    label: 'Display Sequence',
    type: 'select',
    required: true,
    options: SEQUENCE_OPTIONS
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
    name: 'allowsSale',
    label: 'Allows Sale',
    type: 'switch',
    defaultValue: false
  },
  {
    name: 'requiresApproval',
    label: 'Requires Approval',
    type: 'switch',
    defaultValue: false
  },
  {
    name: 'notificationTemplate',
    label: 'Notification Template',
    type: 'textarea',
    placeholder: 'Email/SMS notification template...',
    rows: 4
  }
]
