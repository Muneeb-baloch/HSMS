// lib/types/parking.ts

export interface ParkingSpot {
  _id: string;
  spotNumber: string;
  societyId: string;
  blockId?: string;
  spotType: "resident" | "visitor" | "reserved" | "handicap" | "ev_charging";
  assignedTo?: string;
  assignedPlotId?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  isOccupied: boolean;
  isAvailableForRent: boolean;
  rentPrice?: number;
  status: "active" | "maintenance" | "blocked";
  location?: string;
  createdAt: string;
}

export interface ParkingPass {
  _id: string;
  societyId: string;
  spotId?: string;
  issuedTo: string;
  vehicleNumber: string;
  vehicleType?: string;
  purpose: "visitor" | "delivery" | "contractor" | "event";
  validFrom: string;
  validUntil: string;
  passCode: string;
  status: "active" | "used" | "expired" | "cancelled";
  createdAt: string;
}

export interface CreateSpotDto {
  spotNumber: string;
  societyId: string;
  blockId?: string;
  spotType: string;
  location?: string;
}

export interface CreatePassDto {
  societyId: string;
  spotId?: string;
  issuedTo: string;
  vehicleNumber: string;
  vehicleType?: string;
  purpose: string;
  validFrom: string;
  validUntil: string;
  authorizedBy?: string;
}

export interface SpotQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  spotType?: string;
  isOccupied?: boolean;
  status?: string;
}

export interface PassQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  status?: string;
  purpose?: string;
}

export interface ParkingStats {
  totalSpots: number;
  occupied: number;
  available: number;
  activeVisitorPasses: number;
}
