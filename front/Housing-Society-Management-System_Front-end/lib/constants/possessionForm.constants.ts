// src/lib/constants/possessionForm.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { apiClient } from "@/lib/API/client";
import { PossessionFormData } from "@/lib/schemas/possession.schema";
import { useForm } from "react-hook-form";

const getId = (v: unknown): string | undefined =>
  typeof v === "string"
    ? v
    : v && typeof v === "object" && "_id" in (v as object)
      ? String((v as { _id: string })._id)
      : undefined;

// Fields for requesting a new possession. plotId is intentionally not a
// user-editable field here - it's always derived from the selected file (see
// fileId's onChange below) and rendered disabled, matching the backend rule
// that the plot can never be chosen independently of the file.
export const possessionFormFields: FieldConfig<PossessionFormData>[] = [
  {
    name: "fileId",
    label: "File",
    type: "relationship",
    required: true,
    placeholder: "Select file",
    relationship: {
      endpoint: "/file",
      labelField: "fileRegNo",
      valueField: "_id",
      searchable: true,
    },
    onChange: (
      value: unknown,
      form: ReturnType<typeof useForm<PossessionFormData>>,
    ) => {
      const fileId = getId(value);
      form.setValue("plotId", "");
      form.setValue("memberName", "");
      form.setValue("memberCnic", "");
      if (!fileId) return;
      apiClient
        .get(`/file/${fileId}`)
        .then((res) => {
          const plotId = getId(res.data?.data?.plotId) ?? res.data?.data?.plotId;
          if (plotId) form.setValue("plotId", String(plotId));

          const member = res.data?.data?.member;
          if (member && typeof member === "object") {
            form.setValue("memberName", String(member.memName ?? ""));
            form.setValue("memberCnic", String(member.memNic ?? ""));
          }
        })
        .catch(() => {
          // Leave plotId empty - the create request will fail with the
          // backend's own "File not found" message if this was a bad id.
        });
    },
  },
  {
    name: "plotId",
    label: "Plot",
    type: "relationship",
    required: true,
    disabled: true,
    description: "Derived from the selected file - cannot be changed here",
    relationship: {
      endpoint: "/plots",
      labelField: "plotNo",
      valueField: "_id",
    },
  },
  {
    name: "memberName",
    label: "Member (Owner)",
    type: "text",
    required: false,
    disabled: true,
    placeholder: "Auto-filled from the selected file",
    description: "Owner of the selected file - for confirmation only",
  },
  {
    name: "memberCnic",
    label: "Member CNIC",
    type: "text",
    required: false,
    disabled: true,
    placeholder: "Auto-filled from the selected file",
  },
  {
    name: "possessionInitDate",
    label: "Application Date",
    type: "date",
    required: true,
    placeholder: "Select application date",
  },
  {
    name: "possessionHandoverCSR",
    label: "Handover CSR",
    type: "relationship",
    required: true,
    placeholder: "Select staff member",
    relationship: {
      // Mounted under the v1 user routes (double "users" segment is the
      // actual route: /api/v1/users + router.get('/users', ...)).
      endpoint: "/v1/users/users",
      labelField: "fullName",
      secondaryField: "role",
      valueField: "id",
      searchable: true,
      // Handover CSR must be a staff member, not a member/guest account.
      queryParams: { excludeRoles: "member,guest" },
    },
  },
  {
    name: "possessionRemarks",
    label: "Remarks",
    type: "textarea",
    required: false,
    placeholder: "Enter remarks",
    rows: 3,
  },
  {
    name: "possessionLatitude",
    label: "Latitude",
    type: "number",
    required: false,
    placeholder: "Enter latitude",
    step: 0.000001,
    min: -90,
    max: 90,
  },
  {
    name: "possessionLongitude",
    label: "Longitude",
    type: "number",
    required: false,
    placeholder: "Enter longitude",
    step: 0.000001,
    min: -180,
    max: 180,
  },
];
