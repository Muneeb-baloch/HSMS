// lib/hooks/entities/usePDFGenerator.ts
import { apiClient } from "@/lib/API/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "pdf-generator";

export const useGenerateReceipt = () => {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/pdf/generate/receipt", data);
      return response;
    },
    onSuccess: () => {
      customToast.success("Receipt generated successfully");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to generate receipt");
    },
  });
};

export const useGenerateInvoice = () => {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/pdf/generate/invoice", data);
      return response;
    },
    onSuccess: () => {
      customToast.success("Invoice generated successfully");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to generate invoice");
    },
  });
};

export const useGenerateCertificate = () => {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/pdf/generate/certificate", data);
      return response;
    },
    onSuccess: () => {
      customToast.success("Certificate generated successfully");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to generate certificate");
    },
  });
};

export const useGenerateNOC = () => {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/pdf/generate/noc", data);
      return response;
    },
    onSuccess: () => {
      customToast.success("NOC generated successfully");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to generate NOC");
    },
  });
};

export const useGenerateAllotmentLetter = () => {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/pdf/generate/allotment-letter", data);
      return response;
    },
    onSuccess: () => {
      customToast.success("Allotment letter generated successfully");
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to generate allotment letter");
    },
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "templates"],
    queryFn: async () => {
      const response = await apiClient.get("/pdf/templates");
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch templates");
    },
    staleTime: 10 * 60 * 1000,
  });
};
