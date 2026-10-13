// lib/hooks/entities/useWorkflow.ts
import { workflowApi } from "@/lib/API/workflowApi";
import {
  Workflow,
  WorkflowInstance,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowQueryParams,
} from "@/lib/types/workflow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "workflows";
const INSTANCE_KEY = "workflow-instances";

// ── Workflow Templates ────────────────────────────────────────

export const useWorkflows = (params: WorkflowQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const response = await workflowApi.getAll(params);
      if (response.data.success) {
        return {
          items: response.data.data.workflows,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch workflows");
    },
  });
};

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await workflowApi.getById(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch workflow");
    },
    enabled: !!id,
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkflowDto): Promise<Workflow> => {
      const response = await workflowApi.create(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create workflow");
    },
    onSuccess: () => {
      customToast.success("Workflow created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create workflow");
    },
  });
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWorkflowDto;
    }): Promise<Workflow> => {
      const response = await workflowApi.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update workflow");
    },
    onSuccess: (data) => {
      customToast.success("Workflow updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update workflow");
    },
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await workflowApi.delete(id);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete workflow");
      }
    },
    onSuccess: () => {
      customToast.success("Workflow deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete workflow");
    },
  });
};

// ── Workflow Instances ────────────────────────────────────────

export const useWorkflowInstances = (
  workflowId: string,
  params: { page?: number; limit?: number; status?: string } = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [INSTANCE_KEY, workflowId, queryKeyString],
    queryFn: async () => {
      const response = await workflowApi.getInstances(workflowId, params);
      if (response.data.success) {
        return {
          items: response.data.data.instances,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch workflow instances"
      );
    },
    enabled: !!workflowId,
  });
};

export const useWorkflowInstance = (instanceId: string) => {
  return useQuery({
    queryKey: [INSTANCE_KEY, instanceId],
    queryFn: async () => {
      const response = await workflowApi.getInstance(instanceId);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch workflow instance"
      );
    },
    enabled: !!instanceId,
  });
};

export const useCreateWorkflowInstance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      workflowId: string;
      entityType: string;
      entityId: string;
      societyId: string;
    }): Promise<WorkflowInstance> => {
      const response = await workflowApi.createInstance(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to create workflow instance"
      );
    },
    onSuccess: () => {
      customToast.success("Workflow instance created successfully");
      queryClient.invalidateQueries({ queryKey: [INSTANCE_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create workflow instance");
    },
  });
};

export const useApproveWorkflowStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      instanceId,
      data,
    }: {
      instanceId: string;
      data?: { notes?: string };
    }): Promise<WorkflowInstance> => {
      const response = await workflowApi.approveStep(instanceId, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to approve workflow step"
      );
    },
    onSuccess: (data) => {
      customToast.success("Workflow step approved successfully");
      queryClient.invalidateQueries({ queryKey: [INSTANCE_KEY] });
      queryClient.invalidateQueries({
        queryKey: [INSTANCE_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to approve workflow step");
    },
  });
};

export const useRejectWorkflowStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      instanceId,
      data,
    }: {
      instanceId: string;
      data?: { notes?: string };
    }): Promise<WorkflowInstance> => {
      const response = await workflowApi.rejectStep(instanceId, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to reject workflow step"
      );
    },
    onSuccess: (data) => {
      customToast.success("Workflow step rejected");
      queryClient.invalidateQueries({ queryKey: [INSTANCE_KEY] });
      queryClient.invalidateQueries({
        queryKey: [INSTANCE_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to reject workflow step");
    },
  });
};
