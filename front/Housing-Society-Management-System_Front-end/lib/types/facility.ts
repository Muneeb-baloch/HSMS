// lib/types/facility.ts
export enum FacilityType {
  COMMUNITY_HALL = 'Community Hall',
  SWIMMING_POOL = 'Swimming Pool',
  GYM = 'Gym',
  SPORTS_COURT = 'Sports Court',
  PARK = 'Park',
  BBQ_AREA = 'BBQ Area',
  MEETING_ROOM = 'Meeting Room',
  PARKING = 'Parking',
  OTHER = 'Other',
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
  NO_SHOW = 'NoShow',
  REJECTED = 'Rejected',
}

export interface OperatingHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Facility {
  _id: string;
  facilityName: string;
  facilityCode: string;
  description?: string;
  facilityType: FacilityType;
  location?: string;
  capacity?: number;
  images?: string[];
  amenities?: string[];
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
  securityDeposit: number;
  currency: string;
  operatingHours: OperatingHour[];
  slotDurationMinutes: number;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  cancellationPolicyHours: number;
  requiresApproval: boolean;
  rules?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityBooking {
  _id: string;
  facilityId: string | { _id: string; facilityName: string };
  memberId: string | { _id: string; memName: string };
  bookingCode: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  purpose?: string;
  numberOfGuests: number;
  totalAmount: number;
  depositAmount: number;
  depositRefunded: boolean;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentReference?: string;
  status: BookingStatus;
  approvedBy?: string;
  approvedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFacilityDto {
  facilityName: string;
  facilityType: FacilityType;
  description?: string;
  location?: string;
  capacity?: number;
  hourlyRate?: number;
  halfDayRate?: number;
  fullDayRate?: number;
  securityDeposit?: number;
  operatingHours?: OperatingHour[];
  slotDurationMinutes?: number;
  maxAdvanceBookingDays?: number;
  requiresApproval?: boolean;
  rules?: string;
}

export interface UpdateFacilityDto extends Partial<CreateFacilityDto> {}

export interface FacilityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  facilityType?: string;
  isActive?: boolean;
}

export interface CreateBookingDto {
  facilityId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  numberOfGuests?: number;
}

export interface BookingQueryParams {
  page?: number;
  limit?: number;
  facilityId?: string;
  memberId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}
