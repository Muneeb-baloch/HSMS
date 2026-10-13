// src/lib/constants/complaintForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { ComplaintFormData } from "@/lib/schemas/complaint.schema";

export const complaintFormFields: FieldConfig<ComplaintFormData>[] = [
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
    name: "fileId",
    label: "File",
    type: "relationship",
    required: false,
    relationship: {
      endpoint: "/file",
      labelField: "fileRegNo",
      valueField: "_id",
      searchable: true,
      filter: (item: Record<string, unknown>) => !item.isDeleted,
    },
    placeholder: "Select file (optional)",
  },
  {
    name: "compCatId",
    label: "Category",
    type: "relationship",
    required: true,
    relationship: {
      endpoint: "/complaincatg/active",
      labelField: "categoryName",
      valueField: "_id",
      searchable: true,
      filter: (item: Record<string, unknown>) => item.isActive !== false,
    },
    placeholder: "Select category",
  },
  {
    name: "compTitle",
    label: "Title",
    type: "text",
    required: true,
    placeholder: "Enter complaint title",
  },
  {
    name: "compDescription",
    label: "Description",
    type: "textarea",
    required: true,
    placeholder: "Enter complaint description",
    rows: 4,
  },
  {
    name: "compPriority",
    label: "Priority",
    type: "select",
    required: true,
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Emergency", value: "emergency" },
    ],
    placeholder: "Select priority",
  },
  {
    name: "statusId",
    label: "Status",
    type: "relationship",
    required: true,
    relationship: {
      endpoint: "/status",
      labelField: "statusName",
      valueField: "_id",
      searchable: true,
      filter: (item: Record<string, unknown>) => !item.isDeleted,
    },
    placeholder: "Select status",
  },
  {
    name: "assignedTo",
    label: "Assign To",
    type: "relationship",
    required: false,
    relationship: {
      endpoint: "/userstaff",
      labelField: "fullName",
      valueField: "_id",
      searchable: true,
    },
    placeholder: "Select staff (optional)",
  },
];
