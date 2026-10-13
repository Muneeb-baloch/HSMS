"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CreateVendorDto, UpdateVendorDto } from "@/lib/types/vendor";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const VENDOR_TYPES = [
  { label: "Contractor", value: "contractor" },
  { label: "Supplier", value: "supplier" },
  { label: "Service Provider", value: "service_provider" },
  { label: "Consultant", value: "consultant" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Security", value: "security" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Landscaping", value: "landscaping" },
  { label: "Other", value: "other" },
];

interface VendorFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateVendorDto & { _id?: string }>;
  onSubmit: (data: CreateVendorDto | UpdateVendorDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VendorForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: VendorFormProps) {
  const [formData, setFormData] = useState({
    vendorName: defaultValues?.vendorName || "",
    companyName: defaultValues?.companyName || "",
    email: defaultValues?.email || "",
    phone: defaultValues?.phone || "",
    address: defaultValues?.address || "",
    vendorType: defaultValues?.vendorType || "",
    registrationNumber: defaultValues?.registrationNumber || "",
    taxId: defaultValues?.taxId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.vendorName.trim()) newErrors.vendorName = "Vendor name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.vendorType) newErrors.vendorType = "Vendor type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateVendorDto | UpdateVendorDto = {
      vendorName: formData.vendorName,
      email: formData.email,
      phone: formData.phone,
      vendorType: formData.vendorType,
      ...(formData.companyName && { companyName: formData.companyName }),
      ...(formData.address && { address: formData.address }),
      ...(formData.registrationNumber && { registrationNumber: formData.registrationNumber }),
      ...(formData.taxId && { taxId: formData.taxId }),
    };

    await onSubmit(payload);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
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
            <div className="space-y-2">
              <Label htmlFor="vendorName">
                Vendor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vendorName"
                value={formData.vendorName}
                onChange={(e) => handleChange("vendorName", e.target.value)}
                placeholder="Enter vendor name"
                disabled={isLoading}
              />
              {errors.vendorName && (
                <p className="text-sm text-red-500">{errors.vendorName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Enter company name"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorType">
                Vendor Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vendorType}
                onValueChange={(value) => handleChange("vendorType", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="vendorType">
                  <SelectValue placeholder="Select vendor type" />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendorType && (
                <p className="text-sm text-red-500">{errors.vendorType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) =>
                  handleChange("registrationNumber", e.target.value)
                }
                placeholder="Enter registration number"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleChange("taxId", e.target.value)}
                placeholder="Enter tax ID"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter full address"
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
              {mode === "create" ? "Register Vendor" : "Update Vendor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
