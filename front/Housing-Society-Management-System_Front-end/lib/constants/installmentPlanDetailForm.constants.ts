import { FieldConfig } from '@/components/shared/EntityForm/EntityForm';
import { InstallmentPlanDetailFormData } from '@/lib/schemas/installmentPlanDetail.schema';

export const installmentPlanDetailFormFields: FieldConfig<InstallmentPlanDetailFormData>[] = [
  {
    name: 'planId',
    label: 'Installment Plan',
    type: 'relationship',
    required: true,
    relationship: {
      endpoint: '/installment-plans',
      labelField: 'planName',
      valueField: '_id',
      searchable: true,
      queryParams: { limit: 100, isActive: true },
    },
    placeholder: 'Select plan',
  },
  {
    name: 'instCatId',
    label: 'Installment Category',
    type: 'relationship',
    required: true,
    relationship: {
      endpoint: '/installmentcategory/options',
      labelField: 'name',
      valueField: 'id',
      searchable: false,
    },
    placeholder: 'Select category',
  },
  {
    name: 'occurrence',
    label: 'Occurrence',
    type: 'number',
    required: true,
    placeholder: 'e.g., 1 = Down Payment, 2 = Month 1',
    min: 1,
    step: 1,
  },
  {
    name: 'percentageAmount',
    label: 'Percentage (%)',
    type: 'number',
    required: false,
    placeholder: '0-100',
    min: 0,
    max: 100,
    step: 0.01,
  },
  {
    name: 'fixedAmount',
    label: 'Fixed Amount',
    type: 'number',
    required: false,
    placeholder: 'Fixed amount in PKR',
    min: 0,
    step: 0.01,
  },
];
