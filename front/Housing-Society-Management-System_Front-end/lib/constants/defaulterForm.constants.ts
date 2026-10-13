import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { DefaulterFormData } from "@/lib/schemas/defaulter.schema";

export const defaulterFormFields: FieldConfig<DefaulterFormData>[] = [
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
      filter: (item: Record<string, unknown>) => !item.isDeleted,
    },
    placeholder: "Select member",
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
      filter: (item: Record<string, unknown>) => !item.isDeleted,
    },
    placeholder: "Select plot",
  },
  {
    name: "fileId",
    label: "File",
    type: "relationship",
    required: true,
    relationship: {
      endpoint: "/file",
      labelField: "fileRegNo",
      valueField: "_id",
      searchable: true,
      filter: (item: Record<string, unknown>) => !item.isDeleted,
    },
    placeholder: "Select file",
  },
  {
    name: "totalOverdueAmount",
    label: "Amount",
    type: "number",
    required: true,
    placeholder: "0",
  },
  {
    name: "lastPaymentDate",
    label: "Last Payment Date",
    type: "date",
    required: false,
    placeholder: "Select date",
  },
  {
    name: "noticeSentCount",
    label: "Notice Sent Count",
    type: "number",
    required: false,
    placeholder: "0",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: false,
    options: [
      { label: "Warning", value: "Warning" },
      { label: "Suspended", value: "Suspended" },
      { label: "Legal Action", value: "Legal Action" },
      { label: "Resolved", value: "Resolved" },
    ],
    placeholder: "Select status",
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    required: false,
    placeholder: "Enter remarks",
    rows: 3,
  },
];
