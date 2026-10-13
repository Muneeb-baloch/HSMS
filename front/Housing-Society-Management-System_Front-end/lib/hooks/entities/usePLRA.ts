// lib/hooks/entities/usePLRA.ts
import { plraApi } from "@/lib/API/plraApi";
import {
  PLRACertificate,
  GenerateCertificateDto,
  UpdateCertificateDto,
  CertificateQueryParams,
} from "@/lib/types/plra";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const CERTIFICATE_KEY = "plra-certificates";
const SYNC_LOG_KEY = "plra-sync-logs";
const COMPLIANCE_KEY = "plra-compliance";

// ── Certificates ──────────────────────────────────────────────

export const useCertificates = (params: CertificateQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [CERTIFICATE_KEY, queryKeyString],
    queryFn: async () => {
      const response = await plraApi.getCertificates(params);
      if (response.data.success) {
        return {
          items: response.data.data.certificates,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch certificates"
      );
    },
  });
};

export const useCertificate = (id: string) => {
  return useQuery({
    queryKey: [CERTIFICATE_KEY, id],
    queryFn: async () => {
      const response = await plraApi.getCertificateById(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch certificate"
      );
    },
    enabled: !!id,
  });
};

export const useGenerateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: GenerateCertificateDto
    ): Promise<PLRACertificate> => {
      const response = await plraApi.generateCertificate(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to generate certificate"
      );
    },
    onSuccess: () => {
      customToast.success("Certificate generated successfully");
      queryClient.invalidateQueries({ queryKey: [CERTIFICATE_KEY] });
      queryClient.invalidateQueries({ queryKey: [COMPLIANCE_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to generate certificate");
    },
  });
};

export const useUpdateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCertificateDto;
    }): Promise<PLRACertificate> => {
      const response = await plraApi.updateCertificate(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to update certificate"
      );
    },
    onSuccess: (data) => {
      customToast.success("Certificate updated successfully");
      queryClient.invalidateQueries({ queryKey: [CERTIFICATE_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CERTIFICATE_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update certificate");
    },
  });
};

export const useRevokeCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data?: { reason?: string };
    }): Promise<PLRACertificate> => {
      const response = await plraApi.revokeCertificate(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to revoke certificate"
      );
    },
    onSuccess: (data) => {
      customToast.success("Certificate revoked");
      queryClient.invalidateQueries({ queryKey: [CERTIFICATE_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CERTIFICATE_KEY, data._id],
      });
      queryClient.invalidateQueries({ queryKey: [COMPLIANCE_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to revoke certificate");
    },
  });
};

export const useVerifyCertificate = (qrCode: string) => {
  return useQuery({
    queryKey: [CERTIFICATE_KEY, "verify", qrCode],
    queryFn: async () => {
      const response = await plraApi.verifyCertificate(qrCode);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to verify certificate"
      );
    },
    enabled: !!qrCode,
  });
};

export const useSyncCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<PLRACertificate> => {
      const response = await plraApi.syncCertificate(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to sync certificate"
      );
    },
    onSuccess: (data) => {
      customToast.success("Certificate synced successfully");
      queryClient.invalidateQueries({ queryKey: [CERTIFICATE_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CERTIFICATE_KEY, data._id],
      });
      queryClient.invalidateQueries({ queryKey: [SYNC_LOG_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to sync certificate");
    },
  });
};

// ── Sync Logs ─────────────────────────────────────────────────

export const useSyncLogs = (
  certificateId: string,
  params: { page?: number; limit?: number } = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [SYNC_LOG_KEY, certificateId, queryKeyString],
    queryFn: async () => {
      const response = await plraApi.getSyncLogs(certificateId, params);
      if (response.data.success) {
        return {
          items: response.data.data.logs,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch sync logs"
      );
    },
    enabled: !!certificateId,
  });
};

// ── Compliance ────────────────────────────────────────────────

export const useComplianceDashboard = (societyId: string) => {
  return useQuery({
    queryKey: [COMPLIANCE_KEY, societyId],
    queryFn: async () => {
      const response = await plraApi.getCompliance(societyId);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch compliance dashboard"
      );
    },
    enabled: !!societyId,
  });
};
