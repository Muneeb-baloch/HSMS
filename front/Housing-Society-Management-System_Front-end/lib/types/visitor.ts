// lib/types/visitor.ts
export enum VisitorPurpose {
  PERSONAL = 'Personal',
  BUSINESS = 'Business',
  DELIVERY = 'Delivery',
  MAINTENANCE = 'Maintenance',
  GOVERNMENT = 'Government',
  EMERGENCY = 'Emergency',
  OTHER = 'Other',
}

export enum VisitorStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  CHECKED_IN = 'CheckedIn',
  CHECKED_OUT = 'CheckedOut',
  REJECTED = 'Rejected',
  EXPIRED = 'Expired',
  CANCELLED = 'Cancelled',
}

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  BICYCLE = 'bicycle',
  OTHER = 'other',
}

export interface Visitor {
  _id: string;
  visitorName: string;
  visitorNic?: string;
  visitorPhone: string;
  visitorEmail?: string;
  visitorCompany?: string;
  visitorPhoto?: string;
  vehicleNumber?: string;
  vehicleType?: VehicleType;
  purpose: VisitorPurpose;
  hostMemberId: string | { _id: string; memName: string };
  hostPlotId?: string | { _id: string; plotNo: string };
  passCode: string;
  qrCodeData: string;
  preApproved: boolean;
  preApprovedBy?: string;
  preApprovedAt?: string;
  expectedDate: string;
  expectedTimeIn?: string;
  expectedTimeOut?: string;
  actualTimeIn?: string;
  actualTimeOut?: string;
  checkedInBy?: string;
  checkedOutBy?: string;
  status: VisitorStatus;
  remarks?: string;
  gateNumber?: string;
  numberOfGuests: number;
  createdBy: string;
  modifiedBy?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitorDto {
  visitorName: string;
  visitorPhone: string;
  purpose: VisitorPurpose;
  hostMemberId: string;
  hostPlotId?: string;
  expectedDate: string;
  expectedTimeIn?: string;
  expectedTimeOut?: string;
  vehicleNumber?: string;
  vehicleType?: VehicleType;
  visitorNic?: string;
  visitorEmail?: string;
  visitorCompany?: string;
  numberOfGuests?: number;
  remarks?: string;
}

export interface UpdateVisitorDto extends Partial<CreateVisitorDto> {}

export interface VisitorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  purpose?: string;
  hostMemberId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface VisitorStats {
  total: number;
  today: number;
  pending: number;
  checkedIn: number;
  checkedOut: number;
  expired: number;
}
