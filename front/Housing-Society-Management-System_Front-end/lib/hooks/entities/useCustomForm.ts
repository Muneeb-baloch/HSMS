// lib/hooks/entities/useCustomForm.ts
import { customFormApi } from "@/lib/API/customFormApi";
import {
  CustomFormField,
  CreateCustomFormFieldDto,
  UpdateCustomFormFieldDto,
  CustomFormQueryParams,
} from "@/lib/types/custom-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "custom-forms";

export const useCustomForms = (params: CustomFormQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      const response = await customFormApi.getAll(params);
      if (response.data.success) {
        return {
          items: response.data.data.fields,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch custom forms"
      );
    },
  });
};

export const useCustomForm = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await customFormApi.getById(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch custom form"
      );
    },
    enabled: !!id,
  });
};

export const useCustomFormsByEntity = (
  societyId: string,
  entityType: string
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "entity", societyId, entityType],
    queryFn: async () => {
      const response = await customFormApi.getByEntity(societyId, entityType);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch custom forms by entity"
      );
    },
    enabled: !!societyId && !!entityType,
  });
};

export const useCreateCustomForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: CreateCustomFormFieldDto
    ): Promise<CustomFormField> => {
      const response = await customFormApi.create(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to create custom form field"
      );
    },
    onSuccess: () => {
      customToast.success("Custom form field created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create custom form field");
    },
  });
};

export const useUpdateCustomForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCustomFormFieldDto;
    }): Promise<CustomFormField> => {
      const response = await customFormApi.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to update custom form field"
      );
    },
    onSuccess: (data) => {
      customToast.success("Custom form field updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update custom form field");
    },
  });
};

export const useDeleteCustomForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await customFormApi.delete(id);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete custom form field"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Custom form field deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete custom form field");
    },
  });
};

export const useReorderCustomForms = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      societyId: string;
      entityType: string;
      fieldOrder: { fieldId: string; order: number }[];
    }): Promise<void> => {
      const response = await customFormApi.reorder(data);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to reorder custom form fields"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Custom form fields reordered successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(
        error.message || "Failed to reorder custom form fields"
      );
    },
  });
};

export const useEntityTypes = (societyId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "entity-types", societyId],
    queryFn: async () => {
      const response = await customFormApi.getEntityTypes(societyId);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch entity types"
      );
    },
    enabled: !!societyId,
  });
};
