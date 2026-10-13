export enum LookupCategory {
  POSSESSION_STATUS = 'possession_status',
  TRANSFER_STATUS = 'transfer_status',
  DEFAULTER_STATUS = 'defaulter_status',
  COMPLAINT_PRIORITY = 'complaint_priority',
  COMPLAINT_STATUS = 'complaint_status',
  INSTALLMENT_STATUS = 'installment_status',
  INSTALLMENT_TYPE = 'installment_type',
  PAYMENT_MODE = 'payment_mode',
  FILE_STATUS = 'file_status',
  PLOT_TYPE = 'plot_type',
  PROJECT_STATUS = 'project_status',
  PROJECT_TYPE = 'project_type',
  VISITOR_PURPOSE = 'visitor_purpose',
  VISITOR_STATUS = 'visitor_status',
  VEHICLE_TYPE = 'vehicle_type',
  BILL_TYPE_CATEGORY = 'bill_type_category',
  BILL_STATUS = 'bill_status',
  RELATION_TYPE = 'relation_type',
  DEV_CATEGORY = 'dev_category',
  DEV_PHASE = 'dev_phase',
  FACILITY_TYPE = 'facility_type',
  BOOKING_STATUS = 'booking_status',
  SUBSCRIPTION_STATUS = 'subscription_status',
  SOCIETY_STATUS = 'society_status',
}

export interface LookupValue {
  _id: string
  category: LookupCategory
  code: string
  label: string
  description?: string
  colorCode?: string
  icon?: string
  sequence: number
  isActive: boolean
  isDefault: boolean
  isSystem: boolean
  metadata?: Record<string, unknown>
  parentId?: string
  allowedTransitions?: string[]
  createdBy: string
  modifiedBy?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLookupValueDto {
  category: LookupCategory
  code: string
  label: string
  description?: string
  colorCode?: string
  icon?: string
  sequence?: number
  isActive?: boolean
  isDefault?: boolean
  metadata?: Record<string, unknown>
  allowedTransitions?: string[]
}

export interface UpdateLookupValueDto extends Partial<CreateLookupValueDto> {}

export interface LookupQueryParams {
  page?: number
  limit?: number
  category?: LookupCategory
  search?: string
  isActive?: boolean
}

// Human-readable category labels for the UI
export const CATEGORY_LABELS: Record<LookupCategory, string> = {
  [LookupCategory.POSSESSION_STATUS]: 'Possession Status',
  [LookupCategory.TRANSFER_STATUS]: 'Transfer Status',
  [LookupCategory.DEFAULTER_STATUS]: 'Defaulter Status',
  [LookupCategory.COMPLAINT_PRIORITY]: 'Complaint Priority',
  [LookupCategory.COMPLAINT_STATUS]: 'Complaint Status',
  [LookupCategory.INSTALLMENT_STATUS]: 'Installment Status',
  [LookupCategory.INSTALLMENT_TYPE]: 'Installment Type',
  [LookupCategory.PAYMENT_MODE]: 'Payment Mode',
  [LookupCategory.FILE_STATUS]: 'File Status',
  [LookupCategory.PLOT_TYPE]: 'Plot Type',
  [LookupCategory.PROJECT_STATUS]: 'Project Status',
  [LookupCategory.PROJECT_TYPE]: 'Project Type',
  [LookupCategory.VISITOR_PURPOSE]: 'Visitor Purpose',
  [LookupCategory.VISITOR_STATUS]: 'Visitor Status',
  [LookupCategory.VEHICLE_TYPE]: 'Vehicle Type',
  [LookupCategory.BILL_TYPE_CATEGORY]: 'Bill Type Category',
  [LookupCategory.BILL_STATUS]: 'Bill Status',
  [LookupCategory.RELATION_TYPE]: 'Relation Type',
  [LookupCategory.DEV_CATEGORY]: 'Development Category',
  [LookupCategory.DEV_PHASE]: 'Development Phase',
  [LookupCategory.FACILITY_TYPE]: 'Facility Type',
  [LookupCategory.BOOKING_STATUS]: 'Booking Status',
  [LookupCategory.SUBSCRIPTION_STATUS]: 'Subscription Status',
  [LookupCategory.SOCIETY_STATUS]: 'Society Status',
}
