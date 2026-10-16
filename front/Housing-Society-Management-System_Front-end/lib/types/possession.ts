export enum PossessionStatus {
  REQUESTED = "requested",
  SURVEYED = "surveyed",
  READY = "ready",
  HANDED_OVER = "handed_over",
  CANCELLED = "cancelled",
  ON_HOLD = "on_hold",
}

export interface Possession {
  _id: string;
  fileId: string | { _id: string; fileRegNo: string; plotId?: string };
  plotId: string | { _id: string; plotNo: string; plotSize?: string; blockName?: string };
  possessionStatus: PossessionStatus;
  possessionCode: string;

  possessionInitDate: Date;
  possessionHandoverDate?: Date;
  possessionSurveyPerson?: string;
  possessionSurveyDate?: Date;

  possessionIsCollected: boolean;
  possessionCollectorName?: string;
  possessionCollectorNic?: string;
  possessionCollectionDate?: Date;

  possessionHandoverCSR:
    | string
    | { _id: string; firstName?: string; lastName?: string; email?: string };

  possessionAttachment1?: string;
  possessionAttachment2?: string;
  possessionAttachment3?: string;

  possessionRemarks?: string;
  possessionSurveyRemarks?: string;
  possessionHandoverRemarks?: string;

  possessionLatitude?: number;
  possessionLongitude?: number;

  societyId: string;
  createdBy: string | { _id: string; firstName?: string; lastName?: string };
  updatedBy?: string | { _id: string; firstName?: string; lastName?: string };
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  possessionDurationDays?: number;
  possessionAgeDays?: number;
  statusColor?: string;
  statusDisplayName?: string;
  allowedNextStatuses?: PossessionStatus[];
  formattedInitDate?: string;
  formattedHandoverDate?: string;
}

export interface CreatePossessionDto {
  fileId: string;
  /** Ignored by the API if sent - the plot is always derived server-side from the file. */
  plotId?: string;
  possessionStatus?: PossessionStatus;
  possessionInitDate: Date | string;
  possessionSurveyPerson?: string;
  possessionSurveyDate?: Date | string;
  possessionCollectorName?: string;
  possessionCollectorNic?: string;
  possessionCollectionDate?: Date | string;
  possessionHandoverCSR: string;
  possessionAttachment1?: string;
  possessionAttachment2?: string;
  possessionAttachment3?: string;
  possessionRemarks?: string;
  possessionSurveyRemarks?: string;
  possessionHandoverRemarks?: string;
  possessionLatitude?: number;
  possessionLongitude?: number;
}

export interface UpdatePossessionDto {
  possessionStatus?: PossessionStatus;
  possessionHandoverDate?: Date | string;
  possessionSurveyPerson?: string;
  possessionSurveyDate?: Date | string;
  possessionIsCollected?: boolean;
  possessionCollectorName?: string;
  possessionCollectorNic?: string;
  possessionCollectionDate?: Date | string;
  possessionHandoverCSR?: string;
  possessionAttachment1?: string;
  possessionAttachment2?: string;
  possessionAttachment3?: string;
  possessionRemarks?: string;
  possessionSurveyRemarks?: string;
  possessionHandoverRemarks?: string;
  possessionLatitude?: number;
  possessionLongitude?: number;
}

export interface PossessionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fileId?: string;
  plotId?: string;
  status?: PossessionStatus[];
  isCollected?: boolean;
  csrId?: string;
  startDate?: Date;
  endDate?: Date;
  minDuration?: number;
  maxDuration?: number;
  projectId?: string;
}

export interface StatusTransitionDto {
  possessionId: string;
  newStatus: PossessionStatus;
  remarks?: string;
  surveyPerson?: string;
  surveyDate?: Date;
  handoverDate?: Date;
  attachments?: {
    certificate?: string;
    photo?: string;
    other?: string;
  };
}

export interface CollectorUpdateDto {
  possessionId: string;
  collectorName: string;
  collectorNic: string;
  collectionDate: Date;
  isCollected: boolean;
}
