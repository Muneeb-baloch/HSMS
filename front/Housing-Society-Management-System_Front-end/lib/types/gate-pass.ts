// lib/types/gate-pass.ts

export interface GatePassItem {
  name: string;
  quantity: number;
  unit?: string;
  estimatedValue?: number;
}

export interface GatePass {
  _id: string;
  passNumber: string;
  societyId: string;
  passType:
    | "material_in"
    | "material_out"
    | "furniture_in"
    | "furniture_out"
    | "construction_material"
    | "delivery_large"
    | "moving_in"
    | "moving_out";
  requestedBy: string;
  plotId?: string;
  description: string;
  items: GatePassItem[];
  vehicleNumber?: string;
  vehicleType?: string;
  driverName?: string;
  driverCNIC?: string;
  driverPhone?: string;
  companyName?: string;
  expectedDate: string;
  expectedTime?: string;
  actualEntryTime?: string;
  actualExitTime?: string;
  photos: { url: string; description?: string; capturedAt?: string }[];
  approvedBy?: string;
  status:
    | "requested"
    | "approved"
    | "rejected"
    | "checked_in"
    | "checked_out"
    | "expired"
    | "cancelled";
  passCode?: string;
  securityNotes?: string;
  createdAt: string;
}

export interface CreateGatePassDto {
  societyId: string;
  passType: string;
  plotId?: string;
  description: string;
  items?: GatePassItem[];
  vehicleNumber?: string;
  driverName?: string;
  driverCNIC?: string;
  driverPhone?: string;
  companyName?: string;
  expectedDate: string;
  expectedTime?: string;
}

export interface GatePassQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  passType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}
