// src/lib/constants/userpermissionForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { UserPermissionFormData } from "@/lib/schemas/userpermission.schema";

export const userPermissionFormFields: FieldConfig<UserPermissionFormData>[] = [
  {
    name: "roleId",
    label: "Role",
    type: "relationship",
    required: true,
    placeholder: "Select role",
    relationship: {
      endpoint: "/userrole",
      labelField: "roleName",
      valueField: "_id",
      searchable: true,
    },
  },
  {
    name: "srModuleId",
    label: "Module",
    type: "relationship",
    required: true,
    placeholder: "Select module",
    relationship: {
      endpoint: "/modules",
      labelField: "moduleName",
      valueField: "_id",
      searchable: true,
    },
  },
  {
    name: "canRead",
    label: "Read Access",
    type: "switch",
    required: false,
    defaultValue: false,
  },
  {
    name: "canCreate",
    label: "Create Access",
    type: "switch",
    required: false,
    defaultValue: false,
  },
  {
    name: "canUpdate",
    label: "Update Access",
    type: "switch",
    required: false,
    defaultValue: false,
  },
  {
    name: "canDelete",
    label: "Delete Access",
    type: "switch",
    required: false,
    defaultValue: false,
  },
  {
    name: "canExport",
    label: "Export Access",
    type: "switch",
    required: false,
    defaultValue: false,
  },
  {
    name: "canImport",
    label: "Import Access",
    type: "switch",
    required: false,
    defaultValue: false,
  },
  {
    name: "canApprove",
    label: "Approve Access",
    type: "switch",
    required: false,
    defaultValue: false,
  },
  {
    name: "canVerify",
    label: "Verify Access",
    type: "switch",
    required: false,
    defaultValue: false,
  },
  {
    name: "isActive",
    label: "Active Status",
    type: "switch",
    required: false,
    defaultValue: true,
  },
];
