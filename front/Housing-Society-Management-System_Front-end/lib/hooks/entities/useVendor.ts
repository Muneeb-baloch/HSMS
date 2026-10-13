// lib/hooks/entities/useVendor.ts
import { vendorApi } from "@/lib/API/vendorApi";
import {
  VendorProfile,
  WorkOrder,
  VendorContract,
  VendorInvoice,
  CreateVendorDto,
  UpdateVendorDto,
  VendorQueryParams,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  WorkOrderQueryParams,
  CreateContractDto,
  UpdateContractDto,
  ContractQueryParams,
  CreateInvoiceDto,
  InvoiceQueryParams,
} from "@/lib/types/vendor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const VENDOR_KEY = "vendors";
const WORK_ORDER_KEY = "work-orders";
const CONTRACT_KEY = "vendor-contracts";
const INVOICE_KEY = "vendor-invoices";

// ── Vendors ───────────────────────────────────────────────────

export const useVendors = (params: VendorQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [VENDOR_KEY, queryKeyString],
    queryFn: async () => {
      const response = await vendorApi.getAll(params);
      if (response.data.success) {
        return {
          items: response.data.data.vendors,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch vendors");
    },
  });
};

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: [VENDOR_KEY, id],
    queryFn: async () => {
      const response = await vendorApi.getById(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to fetch vendor");
    },
    enabled: !!id,
  });
};

export const useRegisterVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVendorDto): Promise<VendorProfile> => {
      const response = await vendorApi.register(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to register vendor");
    },
    onSuccess: () => {
      customToast.success("Vendor registered successfully");
      queryClient.invalidateQueries({ queryKey: [VENDOR_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to register vendor");
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateVendorDto;
    }): Promise<VendorProfile> => {
      const response = await vendorApi.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to update vendor");
    },
    onSuccess: (data) => {
      customToast.success("Vendor updated successfully");
      queryClient.invalidateQueries({ queryKey: [VENDOR_KEY] });
      queryClient.invalidateQueries({ queryKey: [VENDOR_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update vendor");
    },
  });
};

export const useVerifyVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<VendorProfile> => {
      const response = await vendorApi.verify(id);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to verify vendor");
    },
    onSuccess: (data) => {
      customToast.success("Vendor verified successfully");
      queryClient.invalidateQueries({ queryKey: [VENDOR_KEY] });
      queryClient.invalidateQueries({ queryKey: [VENDOR_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to verify vendor");
    },
  });
};

export const useSuspendVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data?: { reason?: string };
    }): Promise<VendorProfile> => {
      const response = await vendorApi.suspend(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to suspend vendor");
    },
    onSuccess: (data) => {
      customToast.success("Vendor suspended");
      queryClient.invalidateQueries({ queryKey: [VENDOR_KEY] });
      queryClient.invalidateQueries({ queryKey: [VENDOR_KEY, data._id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to suspend vendor");
    },
  });
};

export const useRateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { rating: number; review?: string };
    }): Promise<void> => {
      const response = await vendorApi.rate(id, data);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to rate vendor");
      }
    },
    onSuccess: () => {
      customToast.success("Vendor rated successfully");
      queryClient.invalidateQueries({ queryKey: [VENDOR_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to rate vendor");
    },
  });
};

// ── Work Orders ───────────────────────────────────────────────

export const useWorkOrders = (params: WorkOrderQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [WORK_ORDER_KEY, queryKeyString],
    queryFn: async () => {
      const response = await vendorApi.workOrders.getAll(params);
      if (response.data.success) {
        return {
          items: response.data.data.workOrders,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch work orders"
      );
    },
  });
};

export const useWorkOrder = (id: string) => {
  return useQuery({
    queryKey: [WORK_ORDER_KEY, id],
    queryFn: async () => {
      const response = await vendorApi.workOrders.getById(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch work order"
      );
    },
    enabled: !!id,
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkOrderDto): Promise<WorkOrder> => {
      const response = await vendorApi.workOrders.create(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to create work order"
      );
    },
    onSuccess: () => {
      customToast.success("Work order created successfully");
      queryClient.invalidateQueries({ queryKey: [WORK_ORDER_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create work order");
    },
  });
};

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWorkOrderDto;
    }): Promise<WorkOrder> => {
      const response = await vendorApi.workOrders.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to update work order"
      );
    },
    onSuccess: (data) => {
      customToast.success("Work order updated successfully");
      queryClient.invalidateQueries({ queryKey: [WORK_ORDER_KEY] });
      queryClient.invalidateQueries({
        queryKey: [WORK_ORDER_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update work order");
    },
  });
};

export const useDeleteWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await vendorApi.workOrders.delete(id);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete work order"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Work order deleted successfully");
      queryClient.invalidateQueries({ queryKey: [WORK_ORDER_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete work order");
    },
  });
};

export const useSubmitBid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { vendorId: string; amount: number; proposal: string };
    }): Promise<WorkOrder> => {
      const response = await vendorApi.workOrders.submitBid(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to submit bid");
    },
    onSuccess: (data) => {
      customToast.success("Bid submitted successfully");
      queryClient.invalidateQueries({ queryKey: [WORK_ORDER_KEY] });
      queryClient.invalidateQueries({
        queryKey: [WORK_ORDER_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to submit bid");
    },
  });
};

export const useAwardWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { vendorId: string; amount: number };
    }): Promise<WorkOrder> => {
      const response = await vendorApi.workOrders.awardOrder(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to award work order"
      );
    },
    onSuccess: (data) => {
      customToast.success("Work order awarded successfully");
      queryClient.invalidateQueries({ queryKey: [WORK_ORDER_KEY] });
      queryClient.invalidateQueries({
        queryKey: [WORK_ORDER_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to award work order");
    },
  });
};

export const useCompleteWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<WorkOrder> => {
      const response = await vendorApi.workOrders.completeOrder(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to complete work order"
      );
    },
    onSuccess: (data) => {
      customToast.success("Work order completed");
      queryClient.invalidateQueries({ queryKey: [WORK_ORDER_KEY] });
      queryClient.invalidateQueries({
        queryKey: [WORK_ORDER_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to complete work order");
    },
  });
};

// ── Contracts ─────────────────────────────────────────────────

export const useVendorContracts = (params: ContractQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [CONTRACT_KEY, queryKeyString],
    queryFn: async () => {
      const response = await vendorApi.contracts.getAll(params);
      if (response.data.success) {
        return {
          items: response.data.data.contracts,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch vendor contracts"
      );
    },
  });
};

export const useVendorContract = (id: string) => {
  return useQuery({
    queryKey: [CONTRACT_KEY, id],
    queryFn: async () => {
      const response = await vendorApi.contracts.getById(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch vendor contract"
      );
    },
    enabled: !!id,
  });
};

export const useCreateVendorContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateContractDto): Promise<VendorContract> => {
      const response = await vendorApi.contracts.create(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to create vendor contract"
      );
    },
    onSuccess: () => {
      customToast.success("Contract created successfully");
      queryClient.invalidateQueries({ queryKey: [CONTRACT_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create contract");
    },
  });
};

export const useUpdateVendorContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateContractDto;
    }): Promise<VendorContract> => {
      const response = await vendorApi.contracts.update(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to update vendor contract"
      );
    },
    onSuccess: (data) => {
      customToast.success("Contract updated successfully");
      queryClient.invalidateQueries({ queryKey: [CONTRACT_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CONTRACT_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update contract");
    },
  });
};

export const useTerminateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data?: { reason?: string };
    }): Promise<VendorContract> => {
      const response = await vendorApi.contracts.terminate(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to terminate contract"
      );
    },
    onSuccess: (data) => {
      customToast.success("Contract terminated");
      queryClient.invalidateQueries({ queryKey: [CONTRACT_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CONTRACT_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to terminate contract");
    },
  });
};

export const useRenewContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { endDate: string; amount?: number };
    }): Promise<VendorContract> => {
      const response = await vendorApi.contracts.renew(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to renew contract"
      );
    },
    onSuccess: (data) => {
      customToast.success("Contract renewed successfully");
      queryClient.invalidateQueries({ queryKey: [CONTRACT_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CONTRACT_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to renew contract");
    },
  });
};

export const useAddPerformanceReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { rating: number; comments: string };
    }): Promise<void> => {
      const response = await vendorApi.contracts.addReview(id, data);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to add performance review"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Performance review added successfully");
      queryClient.invalidateQueries({ queryKey: [CONTRACT_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to add performance review");
    },
  });
};

// ── Invoices ──────────────────────────────────────────────────

export const useVendorInvoices = (params: InvoiceQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [INVOICE_KEY, queryKeyString],
    queryFn: async () => {
      const response = await vendorApi.invoices.getAll(params);
      if (response.data.success) {
        return {
          items: response.data.data.invoices,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch vendor invoices"
      );
    },
  });
};

export const useVendorInvoice = (id: string) => {
  return useQuery({
    queryKey: [INVOICE_KEY, id],
    queryFn: async () => {
      const response = await vendorApi.invoices.getById(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch vendor invoice"
      );
    },
    enabled: !!id,
  });
};

export const useSubmitInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInvoiceDto): Promise<VendorInvoice> => {
      const response = await vendorApi.invoices.submit(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to submit invoice"
      );
    },
    onSuccess: () => {
      customToast.success("Invoice submitted successfully");
      queryClient.invalidateQueries({ queryKey: [INVOICE_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to submit invoice");
    },
  });
};

export const useApproveInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<VendorInvoice> => {
      const response = await vendorApi.invoices.approve(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to approve invoice"
      );
    },
    onSuccess: (data) => {
      customToast.success("Invoice approved successfully");
      queryClient.invalidateQueries({ queryKey: [INVOICE_KEY] });
      queryClient.invalidateQueries({
        queryKey: [INVOICE_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to approve invoice");
    },
  });
};

export const useRejectInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data?: { reason?: string };
    }): Promise<VendorInvoice> => {
      const response = await vendorApi.invoices.reject(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to reject invoice"
      );
    },
    onSuccess: (data) => {
      customToast.success("Invoice rejected");
      queryClient.invalidateQueries({ queryKey: [INVOICE_KEY] });
      queryClient.invalidateQueries({
        queryKey: [INVOICE_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to reject invoice");
    },
  });
};

export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { paymentReference: string; paymentDate?: string };
    }): Promise<VendorInvoice> => {
      const response = await vendorApi.invoices.markPaid(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to mark invoice as paid"
      );
    },
    onSuccess: (data) => {
      customToast.success("Invoice marked as paid");
      queryClient.invalidateQueries({ queryKey: [INVOICE_KEY] });
      queryClient.invalidateQueries({
        queryKey: [INVOICE_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to mark invoice as paid");
    },
  });
};
