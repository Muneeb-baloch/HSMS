// lib/hooks/entities/usePrivacy.ts
import { privacyApi } from "@/lib/API/privacyApi";
import {
  PrivacySettings,
  UpdatePrivacySettingsDto,
  PrivacyScore,
} from "@/lib/types/privacy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "privacy";

export const usePrivacySettings = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "settings"],
    queryFn: async () => {
      const response = await privacyApi.getSettings();
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch privacy settings"
      );
    },
  });
};

export const useUpdatePrivacySettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: UpdatePrivacySettingsDto
    ): Promise<PrivacySettings> => {
      const response = await privacyApi.updateSettings(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to update privacy settings"
      );
    },
    onSuccess: () => {
      customToast.success("Privacy settings updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "settings"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update privacy settings");
    },
  });
};

export const usePrivacySettingsByMember = (memberId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, "settings", "member", memberId],
    queryFn: async () => {
      const response = await privacyApi.getSettingsByMember(memberId);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch member privacy settings"
      );
    },
    enabled: !!memberId,
  });
};

export const usePrivacyAccessLog = (
  params: { page?: number; limit?: number } = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "access-log", queryKeyString],
    queryFn: async () => {
      const response = await privacyApi.getAccessLog(params);
      if (response.data.success) {
        return {
          items: response.data.data.logs,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch privacy access log"
      );
    },
  });
};

export const useRequestDataExport = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await privacyApi.requestExport();
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to request data export"
      );
    },
    onSuccess: () => {
      customToast.success("Data export request submitted successfully");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to request data export");
    },
  });
};

export const useRequestDataDeletion = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await privacyApi.requestDeletion();
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to request data deletion"
      );
    },
    onSuccess: () => {
      customToast.success("Data deletion request submitted successfully");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to request data deletion");
    },
  });
};

export const useConsents = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "consents"],
    queryFn: async () => {
      const response = await privacyApi.getConsents();
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch consents"
      );
    },
  });
};

export const useUpdateConsent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      consentType: string;
      granted: boolean;
    }): Promise<void> => {
      const response = await privacyApi.updateConsent(data);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update consent"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Consent updated successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "consents"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "settings"] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update consent");
    },
  });
};

export const usePrivacyScore = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "score"],
    queryFn: async () => {
      const response = await privacyApi.getScore();
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch privacy score"
      );
    },
  });
};
