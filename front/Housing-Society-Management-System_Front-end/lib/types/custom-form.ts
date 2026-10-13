// lib/types/custom-form.ts

export interface CustomFormField {
  _id: string;
  entityType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType:
    | "text"
    | "number"
    | "date"
    | "select"
    | "multiselect"
    | "file"
    | "boolean"
    | "textarea"
    | "email"
    | "phone"
    | "url";
  options?: { value: string; label: string }[];
  isRequired: boolean;
  defaultValue?: unknown;
  validationRules?: Record<string, unknown>;
  placeholder?: string;
  helpText?: string;
  order: number;
  section?: string;
  visibility?: Record<string, unknown>;
  width: "full" | "half" | "third";
  societyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomFormFieldDto {
  entityType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  options?: { value: string; label: string }[];
  isRequired?: boolean;
  defaultValue?: unknown;
  validationRules?: Record<string, unknown>;
  placeholder?: string;
  helpText?: string;
  order?: number;
  section?: string;
  visibility?: Record<string, unknown>;
  width?: string;
  societyId: string;
}

export interface UpdateCustomFormFieldDto
  extends Partial<CreateCustomFormFieldDto> {}

export interface CustomFormQueryParams {
  page?: number;
  limit?: number;
  entityType?: string;
  societyId?: string;
  fieldType?: string;
  isActive?: boolean;
  search?: string;
}
