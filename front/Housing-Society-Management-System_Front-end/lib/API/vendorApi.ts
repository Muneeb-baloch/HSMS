// lib/API/vendorApi.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
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

const BASE = "/vendors";

export const vendorApi = {
  // ── Vendors ──────────────────────────────────────────────
  register: (data: CreateVendorDto) =>
    apiClient.post<VendorProfile>(`${BASE}/register`, data),

  getAll: (params: VendorQueryParams = {}) => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search) queryParams.search = params.search;
    if (params.vendorType) queryParams.vendorType = params.vendorType;
    if (params.status) queryParams.status = params.status;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    return apiClient.get<{
      vendors: VendorProfile[];
      pagination: PaginatedResponse<VendorProfile>["pagination"];
    }>(BASE, { params: queryParams });
  },

  getById: (id: string) =>
    apiClient.get<VendorProfile>(`${BASE}/${id}`),

  update: (id: string, data: UpdateVendorDto) =>
    apiClient.put<VendorProfile>(`${BASE}/${id}`, data),

  verify: (id: string) =>
    apiClient.patch<VendorProfile>(`${BASE}/${id}/verify`),

  suspend: (id: string, data: { reason?: string } = {}) =>
    apiClient.patch<VendorProfile>(`${BASE}/${id}/suspend`, data),

  rate: (id: string, data: { rating: number; review?: string }) =>
    apiClient.post(`${BASE}/${id}/rate`, data),

  // ── Work Orders ──────────────────────────────────────────
  workOrders: {
    create: (data: CreateWorkOrderDto) =>
      apiClient.post<WorkOrder>(`${BASE}/work-orders`, data),

    getAll: (params: WorkOrderQueryParams = {}) => {
      const queryParams: Record<string, unknown> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };
      if (params.societyId) queryParams.societyId = params.societyId;
      if (params.status) queryParams.status = params.status;
      if (params.category) queryParams.category = params.category;

      return apiClient.get<{
        workOrders: WorkOrder[];
        pagination: PaginatedResponse<WorkOrder>["pagination"];
      }>(`${BASE}/work-orders`, { params: queryParams });
    },

    getById: (id: string) =>
      apiClient.get<WorkOrder>(`${BASE}/work-orders/${id}`),

    update: (id: string, data: UpdateWorkOrderDto) =>
      apiClient.put<WorkOrder>(`${BASE}/work-orders/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`${BASE}/work-orders/${id}`),

    submitBid: (
      id: string,
      data: { vendorId: string; amount: number; proposal: string }
    ) =>
      apiClient.post<WorkOrder>(
        `${BASE}/work-orders/${id}/bids`,
        data
      ),

    awardOrder: (id: string, data: { vendorId: string; amount: number }) =>
      apiClient.patch<WorkOrder>(
        `${BASE}/work-orders/${id}/award`,
        data
      ),

    completeOrder: (id: string) =>
      apiClient.patch<WorkOrder>(
        `${BASE}/work-orders/${id}/complete`
      ),
  },

  // ── Contracts ────────────────────────────────────────────
  contracts: {
    create: (data: CreateContractDto) =>
      apiClient.post<VendorContract>(`${BASE}/contracts`, data),

    getAll: (params: ContractQueryParams = {}) => {
      const queryParams: Record<string, unknown> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };
      if (params.vendorId) queryParams.vendorId = params.vendorId;
      if (params.societyId) queryParams.societyId = params.societyId;
      if (params.status) queryParams.status = params.status;

      return apiClient.get<{
        contracts: VendorContract[];
        pagination: PaginatedResponse<VendorContract>["pagination"];
      }>(`${BASE}/contracts`, { params: queryParams });
    },

    getById: (id: string) =>
      apiClient.get<VendorContract>(`${BASE}/contracts/${id}`),

    update: (id: string, data: UpdateContractDto) =>
      apiClient.put<VendorContract>(`${BASE}/contracts/${id}`, data),

    terminate: (id: string, data: { reason?: string } = {}) =>
      apiClient.patch<VendorContract>(
        `${BASE}/contracts/${id}/terminate`,
        data
      ),

    renew: (id: string, data: { endDate: string; amount?: number } = { endDate: "" }) =>
      apiClient.patch<VendorContract>(
        `${BASE}/contracts/${id}/renew`,
        data
      ),

    addReview: (
      id: string,
      data: { rating: number; comments: string }
    ) =>
      apiClient.post(
        `${BASE}/contracts/${id}/reviews`,
        data
      ),
  },

  // ── Invoices ─────────────────────────────────────────────
  invoices: {
    submit: (data: CreateInvoiceDto) =>
      apiClient.post<VendorInvoice>(`${BASE}/invoices`, data),

    getAll: (params: InvoiceQueryParams = {}) => {
      const queryParams: Record<string, unknown> = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };
      if (params.vendorId) queryParams.vendorId = params.vendorId;
      if (params.societyId) queryParams.societyId = params.societyId;
      if (params.status) queryParams.status = params.status;

      return apiClient.get<{
        invoices: VendorInvoice[];
        pagination: PaginatedResponse<VendorInvoice>["pagination"];
      }>(`${BASE}/invoices`, { params: queryParams });
    },

    getById: (id: string) =>
      apiClient.get<VendorInvoice>(`${BASE}/invoices/${id}`),

    approve: (id: string) =>
      apiClient.patch<VendorInvoice>(
        `${BASE}/invoices/${id}/approve`
      ),

    reject: (id: string, data: { reason?: string } = {}) =>
      apiClient.patch<VendorInvoice>(
        `${BASE}/invoices/${id}/reject`,
        data
      ),

    markPaid: (
      id: string,
      data: { paymentReference: string; paymentDate?: string }
    ) =>
      apiClient.patch<VendorInvoice>(
        `${BASE}/invoices/${id}/pay`,
        data
      ),
  },
};
