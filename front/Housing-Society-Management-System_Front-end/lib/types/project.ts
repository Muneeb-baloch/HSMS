// src/lib/types/project.ts
export enum ProjectStatus {
  PLANNING = "planning",
  UNDER_DEVELOPMENT = "under_development",
  COMPLETED = "completed",
  ON_HOLD = "on_hold",
  CANCELLED = "cancelled",
}

export enum ProjectType {
  RESIDENTIAL = "residential",
  COMMERCIAL = "commercial",
  INDUSTRIAL = "industrial",
  MIXED_USE = "mixed_use",
  AGRICULTURAL = "agricultural",
}

export interface Project {
  _id: string;
  projName: string;
  projCode: string;
  projLocation: string;
  projPrefix: string;
  projDescription?: string;
  totalArea: number;
  areaUnit: string;
  /** Calculated from Plot count - included in API responses */
  totalPlots?: number;
  plotsAvailable?: number;
  plotsSold?: number;
  plotsReserved?: number;
  launchDate: Date;
  completionDate?: Date;
  projStatus: ProjectStatus;
  projType: ProjectType;
  isActive: boolean;
  availabilityPercentage?: number;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  cityId: string | { _id: string; cityName: string; stateId?: string };
  cityName?: string;
  stateName?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  amenities?: string[];
  progressPercentage?: number;
  formattedArea?: string;
  projectAgeMonths?: number;
  statusColor?: string;
  nextPlotNumber?: number;
  createdBy:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  updatedBy?:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface CreateProjectDto {
  projName: string;
  projCode?: string;
  projLocation: string;
  projPrefix: string;
  projDescription?: string;
  totalArea: number;
  areaUnit: string;
  launchDate: Date | string;
  completionDate?: Date | string;
  projStatus?: ProjectStatus;
  projType?: ProjectType;
  isActive?: boolean;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  cityId: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  amenities?: string[];
  societyId?: string;
}

export type UpdateProjectDto = Partial<Omit<CreateProjectDto, "projCode">>;

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: ProjectStatus[];
  type?: ProjectType[];
  isActive?: boolean;
  cityId?: string;
  country?: string;
  minPlots?: number;
  maxPlots?: number;
  minArea?: number;
  maxArea?: number;
  launchedAfter?: Date | string;
  launchedBefore?: Date | string;
}

export interface ProjectStats {
  projName?: string;
  totalProjects: number;
  totalPlots: number;
  totalArea: number;
  plotsSold: number;
  plotsReserved: number;
  plotsAvailable: number;
  averageProgress: number;
  byStatus: Record<ProjectStatus, number>;
  byType: Record<ProjectType, number>;
  byCity: Record<string, number>;
  recentProjects: Project[];
}

export interface PlotRegistrationDto {
  projectId: string;
  plotSizeId: string;
  plotBlockId: string;
  plotCategoryId: string;
  customerId: string;
  registrationNumber: string;
  plotNumber: number;
}

export interface ProjectSummary {
  totalProjects: number;
  totalPlots: number;
  totalArea: number;
  averageProgress: number;
  byStatus: Record<ProjectStatus, number>;
  byType: Record<ProjectType, number>;
}
