// src/lib/hooks/entities/useApplication.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  Application,
  ApplicationQueryParams,
  ApplicationSummary,
  CreateApplicationDto,
  UpdateApplicationDto,
} from "@/lib/types/application";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "applications";

export const useApplications = (params: ApplicationQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const queryParams: Record<string, any> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };

      if (params.search) queryParams.search = params.search;
      if (params.applicationNo)
        queryParams.applicationNo = params.applicationNo;
      if (params.applicationTypeID)
        queryParams.applicationTypeID = params.applicationTypeID;
      if (params.memId) queryParams.memId = params.memId;
      if (params.plotId) queryParams.plotId = params.plotId;
      if (params.statusId) queryParams.statusId = params.statusId;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      const response = await apiClient.get<{
        applications: Application[];
        pagination: PaginatedResponse<Application>["pagination"];
      }>("/application", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.applications,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch applications");
    },
  });
};

export const useApplication = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Application>(`/application/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch application");
    },
    enabled: !!id,
  });
};

export const useApplicationsByType = (typeId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "type", typeId],
    queryFn: async () => {
      const response = await apiClient.get<Application[]>(
        `/application/type/${typeId}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch applications by type",
      );
    },
    enabled: !!typeId,
  });
};

export const useRecentApplications = (limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEY, "recent", limit],
    queryFn: async () => {
      const response = await apiClient.get<Application[]>(
        "/application/recent",
        {
          params: { limit },
        },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch recent applications",
      );
    },
  });
};

export const useApplicationSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "summary"],
    queryFn: async () => {
      const response = await apiClient.get<ApplicationSummary>(
        "/application/summary",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch application summary",
      );
    },
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApplicationDto): Promise<Application> => {
      const response = await apiClient.post<Application>("/application", data);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create application");
    },
    onSuccess: () => {
      customToast.success("Application created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create application");
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateApplicationDto;
    }): Promise<Application> => {
      const response = await apiClient.put<Application>(
        `/application/${id}`,
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update application");
    },
    onSuccess: (data) => {
      customToast.success("Application updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update application");
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/application/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete application",
        );
      }
    },
    onSuccess: () => {
      customToast.success("Application deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "summary"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete application");
    },
  });
};
