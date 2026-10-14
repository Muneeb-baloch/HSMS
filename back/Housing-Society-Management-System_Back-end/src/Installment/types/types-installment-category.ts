import { Types } from 'mongoose';
import { InstallmentCategoryKind } from '../models/models-installment-category';

export interface InstallmentCategoryType {
  _id: Types.ObjectId;
  instCatName: string;
  instCatDescription?: string;
  kind: string;
  isRefundable: boolean;
  isMandatory: boolean;
  sequenceOrder: number;
  isActive: boolean;
  createdBy: Types.ObjectId;
  modifiedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  createdByUser?: any;
  modifiedByUser?: any;
}

export interface CreateInstallmentCategoryDto {
  instCatName: string;
  instCatDescription?: string;
  kind: InstallmentCategoryKind;
  isRefundable?: boolean;
  isMandatory?: boolean;
  sequenceOrder: number;
  isActive?: boolean;
}

export interface UpdateInstallmentCategoryDto {
  instCatName?: string;
  instCatDescription?: string;
  kind?: InstallmentCategoryKind;
  isRefundable?: boolean;
  isMandatory?: boolean;
  sequenceOrder?: number;
  isActive?: boolean;
}

export interface InstallmentCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  kind?: InstallmentCategoryKind;
  isRefundable?: boolean;
  isMandatory?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InstallmentCategorySummary {
  totalCategories: number;
  activeCategories: number;
  mandatoryCategories: number;
  refundableCategories: number;
  categoriesByType: Array<{
    name: string;
    count: number;
    isMandatory: boolean;
    isRefundable: boolean;
  }>;
}

// Default categories for seeding
// NOTE: 'Transfer Fee' is intentionally kept as kind 'other', not a dedicated
// kind — the Transfer module (TransferType.transferFee / Transfer.transferFeeAmount)
// is the sole owner of that money. The installment generator rejects any plan
// detail wired to a transfer-fee-named category rather than silently billing it
// twice; this seed entry exists for societies that want to list it for reference,
// it must never actually be attached to an InstallmentPlan.
export const DEFAULT_INSTALLMENT_CATEGORIES = [
  {
    instCatName: 'Down Payment',
    instCatDescription: 'Initial payment made when booking a property',
    kind: InstallmentCategoryKind.DOWN_PAYMENT,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: 1,
  },
  {
    instCatName: 'Monthly Installment',
    instCatDescription: 'Regular monthly payment',
    kind: InstallmentCategoryKind.INSTALLMENT,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: 2,
  },
  {
    instCatName: 'Quarterly Balloon',
    instCatDescription: 'Quarterly lump sum payment',
    kind: InstallmentCategoryKind.INSTALLMENT,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: 3,
  },
  {
    instCatName: 'Possession Fee',
    instCatDescription: 'Fee charged at the time of possession',
    kind: InstallmentCategoryKind.POSSESSION_FEE,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: 4,
  },
  {
    instCatName: 'Balloting Fee',
    instCatDescription: 'Fee for participating in balloting process',
    kind: InstallmentCategoryKind.OTHER,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: 5,
  },
  {
    instCatName: 'Utility Connection Charges',
    instCatDescription: 'Charges for water, electricity, gas connections',
    kind: InstallmentCategoryKind.OTHER,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: 6,
  },
  {
    instCatName: 'Security Deposit',
    instCatDescription: 'Refundable deposit for utilities',
    kind: InstallmentCategoryKind.OTHER,
    isRefundable: true,
    isMandatory: true,
    sequenceOrder: 7,
  },
  {
    instCatName: 'Development Charges',
    instCatDescription: 'Charges for infrastructure development',
    kind: InstallmentCategoryKind.OTHER,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: 8,
  },
  {
    instCatName: 'Legal Fee',
    instCatDescription: 'Legal documentation and processing fee',
    kind: InstallmentCategoryKind.LEGAL_FEE,
    isRefundable: false,
    isMandatory: true,
    sequenceOrder: 9,
  },
  {
    instCatName: 'Transfer Fee',
    instCatDescription: 'Fee for property transfer',
    kind: InstallmentCategoryKind.OTHER,
    isRefundable: false,
    isMandatory: false,
    sequenceOrder: 10,
  },
  {
    instCatName: 'Application Fee',
    instCatDescription: 'Fee charged for processing a membership/plot application',
    kind: InstallmentCategoryKind.APPLICATION_FEE,
    isRefundable: false,
    isMandatory: false,
    sequenceOrder: 11,
  },
  {
    instCatName: 'NOC Fee',
    instCatDescription: 'Fee for issuing a No Objection Certificate',
    kind: InstallmentCategoryKind.NOC_FEE,
    isRefundable: false,
    isMandatory: false,
    sequenceOrder: 12,
  },
  {
    instCatName: 'Registry Fee',
    instCatDescription: 'Fee for property registry documentation',
    kind: InstallmentCategoryKind.REGISTRY_FEE,
    isRefundable: false,
    isMandatory: false,
    sequenceOrder: 13,
  },
];
