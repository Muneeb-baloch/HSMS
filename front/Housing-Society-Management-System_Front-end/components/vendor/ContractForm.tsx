"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CreateContractDto, UpdateContractDto } from "@/lib/types/vendor";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const PAYMENT_FREQUENCIES = [
  { label: "One-Time", value: "one-time" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Annually", value: "annually" },
];

interface ContractFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateContractDto & { _id?: string }>;
  onSubmit: (data: CreateContractDto | UpdateContractDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ContractForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: ContractFormProps) {
  const [formData, setFormData] = useState({
    vendorId: defaultValues?.vendorId || "",
    societyId: defaultValues?.societyId || "",
    workOrderId: defaultValues?.workOrderId || "",
    contractName: defaultValues?.contractName || "",
    description: defaultValues?.description || "",
    scope: defaultValues?.scope || "",
    startDate: defaultValues?.startDate
      ? new Date(defaultValues.startDate).toISOString().split("T")[0]
      : "",
    endDate: defaultValues?.endDate
      ? new Date(defaultValues.endDate).toISOString().split("T")[0]
      : "",
    amount: defaultValues?.amount?.toString() || "",
    paymentFrequency: defaultValues?.paymentFrequency || "monthly",
    autoRenew: defaultValues?.autoRenew ?? false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.contractName.trim())
      newErrors.contractName = "Contract name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Valid amount is required";
    if (mode === "create") {
      if (!formData.vendorId.trim())
        newErrors.vendorId = "Vendor is required";
      if (!formData.societyId.trim())
        newErrors.societyId = "Society is required";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateContractDto | UpdateContractDto = {
      contractName: formData.contractName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      amount: parseFloat(formData.amount),
      paymentFrequency: formData.paymentFrequency,
      autoRenew: formData.autoRenew,
      ...(formData.description && { description: formData.description }),
      ...(formData.scope && { scope: formData.scope }),
      ...(mode === "create" && {
        vendorId: formData.vendorId,
        societyId: formData.societyId,
      }),
      ...(formData.workOrderId && { workOrderId: formData.workOrderId }),
    };

    await onSubmit(payload);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "string" && errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contractName">
                Contract Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contractName"
                value={formData.contractName}
                onChange={(e) => handleChange("contractName", e.target.value)}
                placeholder="Enter contract name"
                disabled={isLoading}
              />
              {errors.contractName && (
                <p className="text-sm text-red-500">{errors.contractName}</p>
              )}
            </div>

            {mode === "create" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="vendorId">
                    Vendor ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="vendorId"
                    value={formData.vendorId}
                    onChange={(e) => handleChange("vendorId", e.target.value)}
                    placeholder="Enter vendor ID"
                    disabled={isLoading}
                  />
                  {errors.vendorId && (
                    <p className="text-sm text-red-500">{errors.vendorId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="societyId">
                    Society ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="societyId"
                    value={formData.societyId}
                    onChange={(e) => handleChange("societyId", e.target.value)}
                    placeholder="Enter society ID"
                    disabled={isLoading}
                  />
                  {errors.societyId && (
                    <p className="text-sm text-red-500">{errors.societyId}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="workOrderId">Work Order ID (Optional)</Label>
              <Input
                id="workOrderId"
                value={formData.workOrderId}
                onChange={(e) => handleChange("workOrderId", e.target.value)}
                placeholder="Enter work order ID"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="Enter contract amount"
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select
                value={formData.paymentFrequency}
                onValueChange={(value) =>
                  handleChange("paymentFrequency", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="paymentFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                disabled={isLoading}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                disabled={isLoading}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-6">
              <Switch
                id="autoRenew"
                checked={formData.autoRenew}
                onCheckedChange={(checked) =>
                  handleChange("autoRenew", checked)
                }
                disabled={isLoading}
              />
              <Label htmlFor="autoRenew">Auto-Renew Contract</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter contract description"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Scope</Label>
            <Textarea
              id="scope"
              value={formData.scope}
              onChange={(e) => handleChange("scope", e.target.value)}
              placeholder="Define the scope of contract"
              rows={3}
              disabled={isLoading}
            />
          </div>

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
              {mode === "create" ? "Create Contract" : "Update Contract"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
