// src/lib/constants/installmentPlanForm.constants.ts
import { FieldConfig } from '@/components/shared/EntityForm/EntityForm';
import { InstallmentPlanFormData } from '@/lib/schemas/installmentPlan.schema';

export const installmentPlanFormFields: FieldConfig<InstallmentPlanFormData>[] = [
  {
    name: 'projId',
    label: 'Project',
    type: 'relationship',
    required: true,
    relationship: {
      endpoint: '/projects',
      labelField: 'projName',
      valueField: '_id',
      searchable: true,
      queryParams: { limit: 100, isActive: true },
    },
    placeholder: 'Select project',
  },
  {
    name: 'planName',
    label: 'Plan Name',
    type: 'text',
    required: true,
    placeholder: 'Enter plan name (e.g., Standard 24 Months)',
  },
  {
    name: 'totalMonths',
    label: 'Total Months',
    type: 'number',
    required: true,
    placeholder: 'Enter total months (1-360)',
    min: 1,
    max: 360,
    step: 1,
  },
  {
    name: 'totalAmount',
    label: 'Total Amount',
    type: 'number',
    required: true,
    placeholder: 'Enter total amount',
    min: 0,
    step: 0.01,
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'switch',
    required: false,
    defaultValue: true,
  },
];
