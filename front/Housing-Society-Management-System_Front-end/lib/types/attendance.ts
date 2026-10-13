// lib/types/attendance.ts

export interface AttendanceRecord {
  _id: string;
  staffId: string;
  societyId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  checkInLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  isWithinGeofence: boolean;
  geofenceId?: string;
  shiftName?: string;
  status: "present" | "absent" | "late" | "half-day" | "leave" | "holiday";
  totalHours?: number;
  overtimeHours: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Geofence {
  _id: string;
  name: string;
  societyId: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  createdAt: string;
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  leave: number;
  holiday: number;
  totalHours: number;
  overtimeHours: number;
}

export interface CheckInDto {
  societyId: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  geofenceId?: string;
}

export interface CheckOutDto {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface AttendanceQueryParams {
  page?: number;
  limit?: number;
  staffId?: string;
  societyId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CreateGeofenceDto {
  name: string;
  societyId: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface UpdateGeofenceDto extends Partial<CreateGeofenceDto> {}
