// src/lib/hooks/entities/useComplaint.ts
import { complaintApi } from "@/lib/API/complaintApi";
import {
  Complaint,
  ComplaintQueryParams,
  CreateComplaintDto,
  UpdateComplaintDto,
  AssignComplaintDto,
  ResolveComplaintDto,
  EscalateComplaintDto,
} from "@/lib/types/complaint";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "complaints";

export const useComplaints = (params: ComplaintQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const response = await complaintApi.getComplaints(params);

      if (response.data.success) {
        return {
          items: response.data.data.complaints,
          pagination: response.data.data.pagination,
          summary: response.data.data.statistics,
        };
      }
      throw new Error(response.data.message || "Failed to fetch complaints");
    },
  });
};

export const useComplaint = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await complaintApi.getComplaint(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch complaint");
    },
    enabled: !!id,
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateComplaintDto): Promise<Complaint> => {
      const response = await complaintApi.create(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create complaint");
    },
    onSuccess: () => {
      customToast.success("Complaint created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create complaint");
    },
  });
};

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateComplaintDto;
    }): Promise<Complaint> => {
      const response = await complaintApi.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update complaint");
    },
    onSuccess: (data) => {
      customToast.success("Complaint updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update complaint");
    },
  });
};

export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await complaintApi.delete(id);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete complaint"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Complaint deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete complaint");
    },
  });
};

export const useAssignComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AssignComplaintDto;
    }): Promise<Complaint> => {
      const response = await complaintApi.assign(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to assign complaint");
    },
    onSuccess: (data) => {
      customToast.success("Complaint assigned successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to assign complaint");
    },
  });
};

export const useResolveComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ResolveComplaintDto;
    }): Promise<Complaint> => {
      const response = await complaintApi.resolve(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to resolve complaint");
    },
    onSuccess: (data) => {
      customToast.success("Complaint resolved successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to resolve complaint");
    },
  });
};

export const useEscalateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: EscalateComplaintDto;
    }): Promise<Complaint> => {
      const response = await complaintApi.escalate(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to escalate complaint");
    },
    onSuccess: (data) => {
      customToast.success("Complaint escalated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to escalate complaint");
    },
  });
};
