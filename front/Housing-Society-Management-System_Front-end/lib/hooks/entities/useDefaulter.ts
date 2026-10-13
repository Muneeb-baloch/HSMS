import { defaulterApi } from "@/lib/API/defaulterApi";
import {
  Defaulter,
  DefaulterQueryParams,
  CreateDefaulterDto,
  UpdateDefaulterDto,
  SendNoticeDto,
  ResolveDefaulterDto,
  BulkUpdateStatusDto,
} from "@/lib/types/defaulter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "defaulters";

export const useDefaulters = (params: DefaulterQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);
  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const response = await defaulterApi.getDefaulters(params);
      if (response.data.success) {
        return {
          items: response.data.data.defaulters,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch defaulters");
    },
  });
};

export const useDefaulterStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "statistics"],
    queryFn: async () => {
      const response = await defaulterApi.getStatistics();
      if (response.data.success) return response.data.data;
      throw new Error("Failed to fetch statistics");
    },
  });
};

export const useOverdueSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "overdue-summary"],
    queryFn: async () => {
      const response = await defaulterApi.getOverdueSummary();
      if (response.data.success) return response.data.data;
      throw new Error("Failed to fetch overdue summary");
    },
  });
};

export const useActiveCount = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "active-count"],
    queryFn: async () => {
      const response = await defaulterApi.getActiveCount();
      if (response.data.success) return response.data.data;
      throw new Error("Failed to fetch active count");
    },
  });
};

export const useDefaulter = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await defaulterApi.getDefaulter(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch defaulter");
    },
    enabled: !!id,
  });
};

export const useCreateDefaulter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDefaulterDto): Promise<Defaulter> => {
      const response = await defaulterApi.create(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to create defaulter");
    },
    onSuccess: () => {
      customToast.success("Defaulter record created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create defaulter");
    },
  });
};

export const useUpdateDefaulter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDefaulterDto;
    }): Promise<Defaulter> => {
      const response = await defaulterApi.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update defaulter");
    },
    onSuccess: (data) => {
      customToast.success("Defaulter updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update defaulter");
    },
  });
};

export const useDeleteDefaulter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await defaulterApi.delete(id);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete defaulter");
      }
    },
    onSuccess: () => {
      customToast.success("Defaulter deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete defaulter");
    },
  });
};

export const useSendNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: SendNoticeDto;
    }): Promise<Defaulter> => {
      const response = await defaulterApi.sendNotice(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to send notice");
    },
    onSuccess: (data) => {
      customToast.success("Notice sent successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to send notice");
    },
  });
};

export const useResolveDefaulter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ResolveDefaulterDto;
    }): Promise<Defaulter> => {
      const response = await defaulterApi.resolve(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to resolve defaulter");
    },
    onSuccess: (data) => {
      customToast.success("Defaulter resolved successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to resolve defaulter");
    },
  });
};

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BulkUpdateStatusDto) => {
      const response = await defaulterApi.bulkUpdateStatus(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update status");
    },
    onSuccess: () => {
      customToast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update status");
    },
  });
};
