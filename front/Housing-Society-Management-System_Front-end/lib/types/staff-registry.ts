// lib/types/staff-registry.ts

export interface EmploymentRecord {
  societyId: string;
  memberId: string;
  startDate: string;
  endDate?: string;
  role: string;
  rating?: number;
  review?: string;
  isCurrentlyEmployed: boolean;
}

export interface DomesticStaff {
  _id: string;
  fullName: string;
  cnic: string;
  phone?: string;
  photo?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  staffType:
    | "maid"
    | "driver"
    | "cook"
    | "gardener"
    | "guard"
    | "sweeper"
    | "nanny"
    | "tutor"
    | "other";
  isVerified: boolean;
  verificationDate?: string;
  verificationMethod?: string;
  employmentHistory: EmploymentRecord[];
  averageRating: number;
  totalRatings: number;
  blacklisted: boolean;
  blacklistReason?: string;
  skills: string[];
  languages: string[];
  createdAt: string;
}

export interface RegisterStaffDto {
  fullName: string;
  cnic: string;
  phone?: string;
  gender?: string;
  staffType: string;
  address?: string;
  skills?: string[];
  languages?: string[];
}

export interface StaffQueryParams {
  page?: number;
  limit?: number;
  staffType?: string;
  isVerified?: boolean;
  search?: string;
  minRating?: number;
  blacklisted?: boolean;
}
