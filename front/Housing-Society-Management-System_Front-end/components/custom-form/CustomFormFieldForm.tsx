"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateCustomFormFieldDto,
  UpdateCustomFormFieldDto,
} from "@/lib/types/custom-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

const ENTITY_TYPES = [
  { label: "Member", value: "member" },
  { label: "Plot", value: "plot" },
  { label: "Complaint", value: "complaint" },
  { label: "Application", value: "application" },
  { label: "Visitor", value: "visitor" },
  { label: "Facility", value: "facility" },
];

const FIELD_TYPES = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
  { label: "Select", value: "select" },
  { label: "Multi Select", value: "multiselect" },
  { label: "File", value: "file" },
  { label: "Boolean", value: "boolean" },
  { label: "Textarea", value: "textarea" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "URL", value: "url" },
];

const WIDTH_OPTIONS = [
  { label: "Full Width", value: "full" },
  { label: "Half Width", value: "half" },
  { label: "Third Width", value: "third" },
];

interface CustomFormFieldFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateCustomFormFieldDto & { width: string }>;
  onSubmit: (
    data: CreateCustomFormFieldDto | UpdateCustomFormFieldDto
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CustomFormFieldForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: CustomFormFieldFormProps) {
  const [entityType, setEntityType] = useState(
    defaultValues?.entityType || ""
  );
  const [fieldName, setFieldName] = useState(defaultValues?.fieldName || "");
  const [fieldLabel, setFieldLabel] = useState(
    defaultValues?.fieldLabel || ""
  );
  const [fieldType, setFieldType] = useState(defaultValues?.fieldType || "");
  const [isRequired, setIsRequired] = useState(
    defaultValues?.isRequired ?? false
  );
  const [placeholder, setPlaceholder] = useState(
    defaultValues?.placeholder || ""
  );
  const [helpText, setHelpText] = useState(defaultValues?.helpText || "");
  const [order, setOrder] = useState(defaultValues?.order ?? 0);
  const [section, setSection] = useState(defaultValues?.section || "");
  const [width, setWidth] = useState(defaultValues?.width || "full");
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    defaultValues?.options || []
  );
  const [validationMin, setValidationMin] = useState(
    (defaultValues?.validationRules as Record<string, string>)?.min || ""
  );
  const [validationMax, setValidationMax] = useState(
    (defaultValues?.validationRules as Record<string, string>)?.max || ""
  );
  const [validationPattern, setValidationPattern] = useState(
    (defaultValues?.validationRules as Record<string, string>)?.pattern || ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showOptions = fieldType === "select" || fieldType === "multiselect";
  const showValidation =
    fieldType === "text" ||
    fieldType === "number" ||
    fieldType === "textarea" ||
    fieldType === "email" ||
    fieldType === "phone" ||
    fieldType === "url";

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!entityType) newErrors.entityType = "Entity type is required";
    if (!fieldName.trim()) newErrors.fieldName = "Field name is required";
    if (!fieldLabel.trim()) newErrors.fieldLabel = "Field label is required";
    if (!fieldType) newErrors.fieldType = "Field type is required";
    if (showOptions && options.length === 0) {
      newErrors.options = "At least one option is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [entityType, fieldName, fieldLabel, fieldType, showOptions, options]);

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { value: "", label: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    index: number,
    field: "value" | "label",
    val: string
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: val } : opt))
    );
  };

  const handleLabelChange = (value: string) => {
    setFieldLabel(value);
    if (mode === "create") {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
      setFieldName(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const validationRules: Record<string, unknown> = {};
    if (validationMin) validationRules.min = validationMin;
    if (validationMax) validationRules.max = validationMax;
    if (validationPattern) validationRules.pattern = validationPattern;

    const payload: CreateCustomFormFieldDto = {
      entityType,
      fieldName: fieldName.trim(),
      fieldLabel: fieldLabel.trim(),
      fieldType,
      isRequired,
      placeholder: placeholder.trim() || undefined,
      helpText: helpText.trim() || undefined,
      order,
      section: section.trim() || undefined,
      width,
      societyId: defaultValues?.societyId || "",
      ...(showOptions ? { options: options.filter((o) => o.value && o.label) } : {}),
      ...(Object.keys(validationRules).length > 0 ? { validationRules } : {}),
    };

    await onSubmit(payload);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entityType">
                Entity Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={entityType}
                onValueChange={setEntityType}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entityType && (
                <p className="text-sm text-red-500">{errors.entityType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldType">
                Field Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={fieldType}
                onValueChange={setFieldType}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fieldType && (
                <p className="text-sm text-red-500">{errors.fieldType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldLabel">
                Field Label <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fieldLabel"
                value={fieldLabel}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="e.g. Emergency Contact"
                disabled={isLoading}
              />
              {errors.fieldLabel && (
                <p className="text-sm text-red-500">{errors.fieldLabel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldName">
                Field Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fieldName"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. emergency_contact"
                className="font-mono text-sm"
                disabled={isLoading}
              />
              {errors.fieldName && (
                <p className="text-sm text-red-500">{errors.fieldName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="Placeholder text"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Contact Info, Additional Details"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Select
                value={width}
                onValueChange={setWidth}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select width" />
                </SelectTrigger>
                <SelectContent>
                  {WIDTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="helpText">Help Text</Label>
            <Textarea
              id="helpText"
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              placeholder="Help text shown below the field"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isRequired"
              checked={isRequired}
              onCheckedChange={setIsRequired}
              disabled={isLoading}
            />
            <Label htmlFor="isRequired">Required field</Label>
          </div>

          {/* Options Section (for select/multiselect) */}
          {showOptions && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Options ({options.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={isLoading}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Option
                </Button>
              </div>

              {errors.options && (
                <p className="text-sm text-red-500">{errors.options}</p>
              )}

              {options.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
                  No options added. Click &quot;Add Option&quot; to add
                  choices.
                </p>
              )}

              {options.map((opt, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50/50"
                >
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      <Input
                        value={opt.value}
                        onChange={(e) =>
                          handleOptionChange(index, "value", e.target.value)
                        }
                        placeholder="option_value"
                        className="font-mono text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={opt.label}
                        onChange={(e) =>
                          handleOptionChange(index, "label", e.target.value)
                        }
                        placeholder="Display Label"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    disabled={isLoading}
                    className="mt-5"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Validation Rules Section */}
          {showValidation && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Validation Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validationMin">
                    {fieldType === "number" ? "Min Value" : "Min Length"}
                  </Label>
                  <Input
                    id="validationMin"
                    type="number"
                    value={validationMin}
                    onChange={(e) => setValidationMin(e.target.value)}
                    placeholder={
                      fieldType === "number" ? "Min value" : "Min length"
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validationMax">
                    {fieldType === "number" ? "Max Value" : "Max Length"}
                  </Label>
                  <Input
                    id="validationMax"
                    type="number"
                    value={validationMax}
                    onChange={(e) => setValidationMax(e.target.value)}
                    placeholder={
                      fieldType === "number" ? "Max value" : "Max length"
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validationPattern">Pattern (Regex)</Label>
                  <Input
                    id="validationPattern"
                    value={validationPattern}
                    onChange={(e) => setValidationPattern(e.target.value)}
                    placeholder="^[a-zA-Z]+$"
                    className="font-mono text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Field" : "Update Field"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
