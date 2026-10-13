// lib/types/emergency.ts

export interface EmergencyAlert {
  _id: string;
  societyId: string;
  alertType:
    | "sos"
    | "fire"
    | "medical"
    | "security"
    | "natural_disaster"
    | "gas_leak"
    | "other";
  title: string;
  description?: string;
  triggeredBy: string;
  triggerLocation?: { latitude: number; longitude: number };
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "responding" | "resolved" | "false_alarm";
  responders: { userId: string; respondedAt: string; action: string }[];
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  affectedArea?: string;
  notificationsSent: number;
  createdAt: string;
}

export interface MedicalProfile {
  _id: string;
  memberId: string;
  societyId: string;
  bloodGroup?: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyContact: { name: string; phone: string; relationship: string };
  doctorName?: string;
  doctorPhone?: string;
  hospitalPreference?: string;
}

export interface TriggerAlertDto {
  societyId: string;
  alertType: string;
  title: string;
  description?: string;
  triggerLocation?: { latitude: number; longitude: number };
  severity?: string;
  affectedArea?: string;
}

export interface EmergencyQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  alertType?: string;
  severity?: string;
  status?: string;
}

export interface UpdateMedicalProfileDto {
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  emergencyContact?: { name: string; phone: string; relationship: string };
  doctorName?: string;
  doctorPhone?: string;
  hospitalPreference?: string;
}
