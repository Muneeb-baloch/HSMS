// lib/types/plra.ts

export interface PLRACertificate {
  _id: string;
  plotId: string;
  memberId: string;
  societyId: string;
  certificateNumber: string;
  certificateType: "ownership" | "allotment" | "transfer" | "possession";
  issuedDate: string;
  validUntil?: string;
  propertyDetails: {
    area: number;
    areaUnit: string;
    boundaries: string;
    address: string;
    plotNumber: string;
    blockName: string;
  };
  ownerDetails: {
    name: string;
    cnic: string;
    fatherName: string;
    address: string;
  };
  qrCode: string;
  digitalSignature?: string;
  plraReferenceNumber?: string;
  syncStatus: "pending" | "synced" | "failed" | "manual";
  pdfUrl?: string;
  status: "draft" | "issued" | "verified" | "revoked" | "expired";
  issuedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PLRASyncLog {
  _id: string;
  certificateId: string;
  action: string;
  status: "success" | "failed" | "timeout";
  errorMessage?: string;
  duration?: number;
  initiatedBy: string;
  timestamp: string;
}

export interface ComplianceDashboard {
  totalCertificates: number;
  syncedCount: number;
  pendingCount: number;
  failedCount: number;
  recentLogs: PLRASyncLog[];
}

export interface GenerateCertificateDto {
  plotId: string;
  memberId: string;
  societyId: string;
  certificateType: string;
  propertyDetails: {
    area: number;
    areaUnit: string;
    boundaries: string;
    address: string;
    plotNumber: string;
    blockName: string;
  };
  ownerDetails: {
    name: string;
    cnic: string;
    fatherName: string;
    address: string;
  };
}

export interface UpdateCertificateDto
  extends Partial<GenerateCertificateDto> {}

export interface CertificateQueryParams {
  page?: number;
  limit?: number;
  societyId?: string;
  plotId?: string;
  memberId?: string;
  certificateType?: string;
  status?: string;
  syncStatus?: string;
}
