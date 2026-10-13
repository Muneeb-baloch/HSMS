// src/lib/constants/city.constants.ts
import { FieldConfig } from "@/components/shared/EntityForm/EntityForm";
import { CityFormData } from "@/lib/schemas/city.schema";

export const cityFormFields: FieldConfig<CityFormData>[] = [
  {
    name: "cityName",
    label: "City Name",
    type: "text",
    required: true,
    placeholder: "Enter city name",
  },
  {
    name: "stateId",
    label: "State",
    type: "relationship",
    required: true,
    relationship: {
      endpoint: "states",
      labelField: "stateName",
      valueField: "_id",
      searchable: true,
    },
  },
  {
    name: "cityDescription",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter city description (optional)",
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
