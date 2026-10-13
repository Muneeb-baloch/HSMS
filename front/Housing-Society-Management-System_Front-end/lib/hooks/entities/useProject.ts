// src/lib/hooks/entities/useProject.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateProjectDto,
  Project,
  ProjectQueryParams,
  ProjectStats,
  UpdateProjectDto,
} from "@/lib/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "projects";

export const useProjects = (params: ProjectQueryParams = {}) => {
  // Create a stable query key string for proper change detection
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      // Build query params with proper formatting
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};

      // Pagination - always include
      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 10;

      // Sorting
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      // Search
      if (params.search) queryParams.search = params.search;

      // Status filter - ensure it's properly formatted as array
      if (
        params.status &&
        Array.isArray(params.status) &&
        params.status.length > 0
      ) {
        queryParams.status = params.status.join(",");
      }

      // Type filter - ensure it's properly formatted as array
      if (params.type && Array.isArray(params.type) && params.type.length > 0) {
        queryParams.type = params.type.join(",");
      }

      // Active status
      if (params.isActive !== undefined) {
        queryParams.isActive = params.isActive;
      }

      // Additional filters
      if (params.cityId) queryParams.cityId = params.cityId;
      if (params.country) queryParams.country = params.country;
      if (params.minPlots !== undefined) queryParams.minPlots = params.minPlots;
      if (params.maxPlots !== undefined) queryParams.maxPlots = params.maxPlots;
      if (params.minArea !== undefined) queryParams.minArea = params.minArea;
      if (params.maxArea !== undefined) queryParams.maxArea = params.maxArea;

      // Date filters
      if (params.launchedAfter) {
        const date =
          params.launchedAfter instanceof Date
            ? params.launchedAfter.toISOString()
            : params.launchedAfter;
        queryParams.launchedAfter = date;
      }

      if (params.launchedBefore) {
        const date =
          params.launchedBefore instanceof Date
            ? params.launchedBefore.toISOString()
            : params.launchedBefore;
        queryParams.launchedBefore = date;
      }

      const response = await apiClient.get<{
        projects: Project[];
        summary: unknown;
        pagination: PaginatedResponse<Project>["pagination"];
      }>("/projects", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.projects,
          summary: response.data.data.summary,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch projects");
    },
  });
};

export const useActiveProjects = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async () => {
      const response = await apiClient.get<Project[]>("/projects/active");

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch active projects",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useProject = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Project>(`/projects/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch project");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const projectsData = queryClient.getQueryData<any>([QUERY_KEY, {}]);
      return projectsData?.items.find((p: Project) => p._id === id);
    },
  });
};

export const useProjectByCode = (code: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "code", code],
    queryFn: async () => {
      const response = await apiClient.get<Project>(`/projects/code/${code}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch project");
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectDto): Promise<Project> => {
      const response = await apiClient.post<Project>("/projects", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create project");
    },
    onSuccess: () => {
      customToast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create project");
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProjectDto;
    }): Promise<Project> => {
      const response = await apiClient.put<Project>(`/projects/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update project");
    },
    onSuccess: (_, variables) => {
      customToast.success("Project updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update project");
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/projects/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete project");
      }
    },
    onSuccess: () => {
      customToast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete project");
    },
  });
};

export const useToggleProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Project> => {
      const response = await apiClient.patch<Project>(
        `/projects/${id}/toggle-status`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to toggle status");
    },
    onSuccess: (_, id) => {
      customToast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to toggle status");
    },
  });
};

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }): Promise<Project> => {
      const response = await apiClient.patch<Project>(
        `/projects/${id}/status`,
        { status },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to update project status",
      );
    },
    onSuccess: (_, variables) => {
      customToast.success("Project status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update project status");
    },
  });
};

export const useProjectStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await apiClient.get<ProjectStats>(
        "/projects/statistics",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch project statistics",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectsByCity = (cityId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "city", cityId],
    queryFn: async () => {
      const response = await apiClient.get<Project[]>(
        `/projects/city/id/${cityId}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch projects by city",
      );
    },
    enabled: !!cityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGenerateNextPlotNumber = (projectId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, projectId, "next-plot"],
    queryFn: async () => {
      const response = await apiClient.get<{ nextPlotNumber: string }>(
        `/projects/${projectId}/next-plot-number`,
      );

      if (response.data.success) {
        return response.data.data.nextPlotNumber;
      }
      throw new Error(
        response.data.message || "Failed to generate next plot number",
      );
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useIncrementPlotCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      type,
      count = 1,
    }: {
      projectId: string;
      type: "sold" | "reserved";
      count?: number;
    }): Promise<Project> => {
      const response = await apiClient.post<Project>(
        `/projects/${projectId}/plots/increment`,
        { type, count },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to increment plot count",
      );
    },
    onSuccess: (_, variables) => {
      customToast.success(`Plot marked as ${variables.type}`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.projectId],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update plot count");
    },
  });
};

export const useDecrementPlotCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      type,
      count = 1,
    }: {
      projectId: string;
      type: "sold" | "reserved";
      count?: number;
    }): Promise<Project> => {
      const response = await apiClient.post<Project>(
        `/projects/${projectId}/plots/decrement`,
        { type, count },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to decrement plot count",
      );
    },
    onSuccess: (_, variables) => {
      customToast.success(`Plot removed from ${variables.type}`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.projectId],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update plot count");
    },
  });
};

export const useProjectsByStatus = (status: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "status", status],
    queryFn: async () => {
      const response = await apiClient.get<Project[]>(
        `/projects/status/${status}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch projects by status",
      );
    },
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectsNearLocation = (
  latitude: number,
  longitude: number,
  maxDistance?: number,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "location", latitude, longitude, maxDistance],
    queryFn: async () => {
      const params: any = { latitude, longitude };
      if (maxDistance) params.maxDistance = maxDistance;

      const response = await apiClient.get<Project[]>(
        "/projects/location/near",
        { params },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch projects near location",
      );
    },
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectsWithLowAvailability = (threshold: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEY, "low-availability", threshold],
    queryFn: async () => {
      const response = await apiClient.get<Project[]>(
        "/projects/low-availability",
        {
          params: { threshold },
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message ||
          "Failed to fetch projects with low availability",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useBulkUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectIds,
      status,
    }: {
      projectIds: string[];
      status: string;
    }): Promise<{ matched: number; modified: number }> => {
      const response = await apiClient.post<any>("/projects/bulk/status", {
        projectIds,
        status,
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to update project statuses",
      );
    },
    onSuccess: (data) => {
      customToast.success(`Status updated for ${data.modified} projects`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update project statuses");
    },
  });
};

export const useProjectTimeline = (projectId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, projectId, "timeline"],
    queryFn: async () => {
      const response = await apiClient.get<any[]>(
        `/projects/${projectId}/timeline`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch project timeline",
      );
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
};

export interface AreaSummary {
  areaUnit: string;
  area: number;
  allocated: number;
  remaining: number;
}

/** Live "area remaining" for a project - used by the Plot Block create/edit form. */
export const useProjectAreaSummary = (projectId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEY, projectId, "area-summary"],
    queryFn: async () => {
      const response = await apiClient.get<AreaSummary>(
        `/projects/${projectId}/area-summary`,
      );
      if (response.data.success) {
        return response.data.data as AreaSummary;
      }
      throw new Error(response.data.message || "Failed to fetch area summary");
    },
    enabled: !!projectId,
    staleTime: 0,
  });
};
