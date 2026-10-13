// src/lib/constants/userstaffForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { UserStaffFormData } from "@/lib/schemas/userstaff.schema";

export const userStaffFormFields: FieldConfig<UserStaffFormData>[] = [
  {
    name: "userName",
    label: "Username",
    type: "text",
    required: true,
    placeholder: "Enter username (e.g., john_doe)",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    placeholder: "Enter password",
    showStrength: true,
  },
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter full name",
  },
  {
    name: "cnic",
    label: "CNIC",
    type: "text",
    required: true,
    placeholder: "XXXXX-XXXXXXX-X",
  },
  {
    name: "mobileNo",
    label: "Mobile Number",
    type: "text",
    required: false,
    placeholder: "+92 3XX XXXXXXX",
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    required: false,
    placeholder: "user@example.com",
  },
  {
    name: "roleId",
    label: "Role",
    type: "select",
    required: true,
    placeholder: "Select role",
    options: [], // Will be populated dynamically
  },
  {
    name: "cityId",
    label: "State & City",
    type: "state-city",
    required: true,
    placeholder: "Select state, then city",
  },
  {
    name: "designation",
    label: "Designation",
    type: "text",
    required: false,
    placeholder: "Enter designation",
  },
  {
    name: "isActive",
    label: "Active Status",
    type: "switch",
    required: false,
    defaultValue: true,
  },
];
