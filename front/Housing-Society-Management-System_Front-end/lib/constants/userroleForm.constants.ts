// src/lib/constants/userroleForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { UserRoleFormData } from "@/lib/schemas/userrole.schema";

export const userRoleFormFields: FieldConfig<UserRoleFormData>[] = [
  {
    name: "roleName",
    label: "Role Name",
    type: "text",
    required: true,
    placeholder: "Enter role name (e.g., Administrator, Manager)",
  },
  {
    name: "roleCode",
    label: "Role Code",
    type: "text",
    required: true,
    placeholder: "Enter role code (e.g., ADMIN, MANAGER)",
  },
  {
    name: "roleDescription",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter role description",
    rows: 3,
  },
  {
    name: "priority",
    label: "Priority",
    type: "number",
    required: false,
    placeholder: "Enter priority (0-1000)",
    min: 0,
    max: 1000,
    step: 1,
    defaultValue: 0,
  },
  {
    name: "isActive",
    label: "Active Status",
    type: "switch",
    required: false,
    defaultValue: true,
  },
];
