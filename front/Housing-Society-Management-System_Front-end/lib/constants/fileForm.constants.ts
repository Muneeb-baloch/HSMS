// src/lib/constants/fileForm.constants.ts
import { apiClient } from "@/lib/API/client";
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { FileFormData } from "@/lib/schemas/file.schema";
import { FileStatus, PaymentMode } from "@/lib/types/file";

const getMemberId = (v: unknown): string | undefined =>
  typeof v === "string" ? v : v && typeof v === "object" && "_id" in (v as object) ? String((v as { _id: string })._id) : undefined;

export const fileFormFields: FieldConfig<FileFormData>[] = [
  {
    name: "fileRegNo",
    label: "File Registration Number",
    type: "text",
    required: false,
    placeholder: "Auto-generated if left blank",
    description: "Leave blank to auto-generate file number",
  },
  {
    name: "fileBarCode",
    label: "File Barcode",
    type: "text",
    required: true,
    placeholder: "Enter barcode",
    description: "Barcode is required by the backend",
  },
  {
    name: "projId",
    label: "Project",
    type: "relationship",
    required: true,
    relationship: {
      endpoint: "/projects",
      labelField: "projName",
      valueField: "_id",
      searchable: true,
      filter: (item: any) => !item.isDeleted && item.isActive,
    },
    placeholder: "Select project",
    description: "Choose the project for this file",
  },
  {
    name: "planId",
    label: "Installment Plan",
    type: "relationship",
    required: false,
    showWhen: (values) => !!(values as { projId?: string }).projId,
    relationship: {
      endpoint: (values) =>
        (values as { projId?: string }).projId
          ? `/installment-plans/by-project/${(values as { projId?: string }).projId}`
          : "/installment-plans?limit=0",
      labelField: "planName",
      valueField: "_id",
      searchable: true,
    },
    placeholder: "Select installment plan (optional)",
    description: "Choose the plan (plans shown for selected project)",
    onChange: async (value, form) => {
      if (value && typeof value === "string") {
        try {
          const res = await apiClient.get<{ data?: { totalAmount?: number } }>(
            `/installment-plans/${value}`
          );
          if (
            res?.data?.success &&
            res?.data?.data?.totalAmount != null &&
            res.data.data.totalAmount > 0
          ) {
            form.setValue("totalAmount", res.data.data.totalAmount);
          }
        } catch {
          /* ignore */
        }
      }
    },
  },
  {
    name: "memId",
    label: "Member",
    type: "relationship",
    required: true,
    relationship: {
      endpoint: "/members",
      labelField: "memName",
      valueField: "_id",
      searchable: true,
      filter: (item: any) => !item.isDeleted,
    },
    placeholder: "Select member",
    description: "Choose the member for this file",
    onChange: (_, form) => form.setValue("nomineeId", ""),
  },
  {
    name: "nomineeId",
    label: "Nominee",
    type: "relationship",
    required: false,
    showWhen: (values) => !!getMemberId((values as { memId?: unknown }).memId),
    relationship: {
      endpoint: (values) => {
        const memId = getMemberId((values as { memId?: unknown }).memId);
        return memId ? `/nominee/member/${memId}` : "/nominee?limit=0";
      },
      labelField: "nomineeName",
      valueField: "_id",
      searchable: false,
      filter: (item: any) => !item.isDeleted,
    },
    placeholder: "Select nominee (optional)",
    description: "Choose a nominee for this member (select member first)",
  },
  {
    name: "plotId",
    label: "Plot",
    type: "relationship",
    required: true,
    showWhen: (values) => !!(values as { projId?: string }).projId,
    relationship: {
      endpoint: (values) =>
        (values as { projId?: string }).projId
          ? `/plots?projectId=${(values as { projId?: string }).projId}`
          : "/plots?limit=0",
      labelField: "plotNo",
      valueField: "_id",
      searchable: true,
      filter: (item: any) => !item.isDeleted && item.isActive,
    },
    placeholder: "Select plot",
    description: "Choose the plot for this file (required)",
  },
  {
    name: "applicationId",
    label: "Application",
    type: "relationship",
    required: false,
    relationship: {
      endpoint: "/application",
      labelField: "applicationNo",
      valueField: "_id",
      searchable: true,
      filter: (item: any) => !item.isDeleted,
    },
    placeholder: "Select application (optional)",
    description: "Choose the application for this file",
  },
  {
    name: "totalAmount",
    label: "Total Amount",
    type: "number",
    required: true,
    placeholder: "Enter total amount",
    description: "Total amount for the file",
    min: 0,
    step: 0.01,
  },
  {
    name: "downPayment",
    label: "Down Payment",
    type: "number",
    required: true,
    placeholder: "Enter down payment amount",
    description: "Down payment amount",
    min: 0,
    step: 0.01,
  },
  {
    name: "paymentMode",
    label: "Payment Mode",
    type: "select",
    required: true,
    options: Object.values(PaymentMode).map((mode) => ({
      label: mode,
      value: mode,
    })),
    placeholder: "Select payment mode",
    description: "Choose the payment mode",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: Object.values(FileStatus).map((status) => ({
      label: status,
      value: status,
    })),
    placeholder: "Select file status",
    description: "Current status of the file",
  },
  {
    name: "bookingDate",
    label: "Booking Date",
    type: "date",
    required: true,
    placeholder: "Select booking date",
    description: "Date when the file was booked",
  },
  {
    name: "expectedCompletionDate",
    label: "Expected Completion Date",
    type: "date",
    required: false,
    placeholder: "Select expected completion date",
    description: "Expected completion date for the file",
  },
  {
    name: "fileRemarks",
    label: "Remarks",
    type: "textarea",
    required: false,
    placeholder: "Enter any additional remarks",
    description: "Additional notes about the file",
    rows: 3,
  },
];

export const updateFileFormFields: FieldConfig<any>[] = [
  {
    name: "projId",
    label: "Project",
    type: "relationship",
    required: false,
    disabled: true,
    relationship: {
      endpoint: "/projects",
      labelField: "projName",
      valueField: "_id",
      searchable: false,
    },
    description: "Project (read-only; plan options depend on this)",
  },
  {
    name: "memId",
    label: "Member",
    type: "relationship",
    required: false,
    disabled: true,
    relationship: {
      endpoint: "/members",
      labelField: "memName",
      valueField: "_id",
      searchable: false,
    },
    description: "Member (read-only; nominee options depend on this)",
  },
  {
    name: "planId",
    label: "Installment Plan",
    type: "relationship",
    required: false,
    showWhen: (values) => !!(values as { projId?: string }).projId,
    relationship: {
      endpoint: (values) =>
        (values as { projId?: string }).projId
          ? `/installment-plans/by-project/${(values as { projId?: string }).projId}`
          : "/installment-plans?limit=0",
      labelField: "planName",
      valueField: "id",
      searchable: false,
    },
    placeholder: "Select installment plan",
    description: "Choose the plan (plans shown for selected project)",
  },
  {
    name: "fileBarCode",
    label: "File Barcode",
    type: "text",
    required: false,
    placeholder: "Enter barcode",
    description: "Barcode for the file",
  },
  {
    name: "nomineeId",
    label: "Nominee",
    type: "relationship",
    required: false,
    showWhen: (values) => !!getMemberId((values as { memId?: unknown }).memId),
    relationship: {
      endpoint: (values) => {
        const memId = getMemberId((values as { memId?: unknown }).memId);
        return memId ? `/nominee/member/${memId}` : "/nominee?limit=0";
      },
      labelField: "nomineeName",
      valueField: "_id",
      searchable: false,
      filter: (item: any) => !item.isDeleted,
    },
    placeholder: "Select nominee (optional)",
    description: "Choose a nominee for this member (dependent on member above)",
  },
  {
    name: "plotId",
    label: "Plot",
    type: "relationship",
    required: true,
    relationship: {
      endpoint: "/plots",
      labelField: "plotNo",
      valueField: "_id",
      searchable: true,
      filter: (item: any) => !item.isDeleted && item.isActive,
    },
    placeholder: "Select plot",
    description: "Choose the plot for this file (required)",
  },
  {
    name: "totalAmount",
    label: "Total Amount",
    type: "number",
    required: false,
    placeholder: "Enter total amount",
    description: "Total amount for the file",
    min: 0,
    step: 0.01,
  },
  {
    name: "downPayment",
    label: "Down Payment",
    type: "number",
    required: false,
    placeholder: "Enter down payment amount",
    description: "Down payment amount",
    min: 0,
    step: 0.01,
  },
  {
    name: "paymentMode",
    label: "Payment Mode",
    type: "select",
    required: false,
    options: Object.values(PaymentMode).map((mode) => ({
      label: mode,
      value: mode,
    })),
    placeholder: "Select payment mode",
    description: "Choose the payment mode",
  },
  {
    name: "isAdjusted",
    label: "Is Adjusted",
    type: "switch",
    required: false,
    description: "Check if the file has been adjusted",
  },
  {
    name: "adjustmentRef",
    label: "Adjustment Reference",
    type: "text",
    required: false,
    placeholder: "Enter adjustment reference",
    description: "Reference for file adjustment",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: false,
    options: Object.values(FileStatus).map((status) => ({
      label: status,
      value: status,
    })),
    placeholder: "Select file status",
    description: "Current status of the file",
  },
  {
    name: "fileRemarks",
    label: "Remarks",
    type: "textarea",
    required: false,
    placeholder: "Enter any additional remarks",
    description: "Additional notes about the file",
    rows: 3,
  },
  {
    name: "expectedCompletionDate",
    label: "Expected Completion Date",
    type: "date",
    required: false,
    placeholder: "Select expected completion date",
    description: "Expected completion date for the file",
  },
  {
    name: "actualCompletionDate",
    label: "Actual Completion Date",
    type: "date",
    required: false,
    placeholder: "Select actual completion date",
    description: "Actual completion date for the file",
  },
  {
    name: "cancellationReason",
    label: "Cancellation Reason",
    type: "textarea",
    required: false,
    placeholder: "Enter cancellation reason",
    description: "Reason for file cancellation",
    rows: 2,
  },
  {
    name: "isActive",
    label: "Is Active",
    type: "switch",
    required: false,
    description: "Check if the file is active",
  },
];
