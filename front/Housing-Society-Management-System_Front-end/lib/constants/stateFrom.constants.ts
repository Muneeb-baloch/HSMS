// src/lib/constants/state.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { StateFormData } from "@/lib/schemas/state.schema";

export const stateFormFields: FieldConfig<StateFormData>[] = [
  {
    name: "stateName",
    label: "State Name",
    type: "text",
    required: true,
    placeholder: "Enter state name",
  },
  {
    name: "stateDescription",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter state description (optional)",
  },
  {
    name: "statusId",
    label: "Status",
    type: "relationship",
    required: false,
    relationship: {
      endpoint: "statuses",
      labelField: "statusName",
      valueField: "_id",
      searchable: true,
    },
  },
];
