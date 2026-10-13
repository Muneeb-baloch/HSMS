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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const PASS_TYPE_OPTIONS = [
  { label: "Material In", value: "material_in" },
  { label: "Material Out", value: "material_out" },
  { label: "Furniture In", value: "furniture_in" },
  { label: "Furniture Out", value: "furniture_out" },
  { label: "Construction Material", value: "construction_material" },
  { label: "Large Delivery", value: "delivery_large" },
  { label: "Moving In", value: "moving_in" },
  { label: "Moving Out", value: "moving_out" },
];

interface PassItem {
  name: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
}

interface GatePassFormProps {
  defaultValues?: Record<string, any>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function GatePassForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Request Gate Pass",
}: GatePassFormProps) {
  const [passType, setPassType] = useState(defaultValues?.passType || "");
  const [description, setDescription] = useState(
    defaultValues?.description || ""
  );
  const [expectedDate, setExpectedDate] = useState(
    defaultValues?.expectedDate
      ? new Date(defaultValues.expectedDate).toISOString().split("T")[0]
      : ""
  );
  const [expectedTime, setExpectedTime] = useState(
    defaultValues?.expectedTime || ""
  );
  const [vehicleNumber, setVehicleNumber] = useState(
    defaultValues?.vehicleNumber || ""
  );
  const [vehicleType, setVehicleType] = useState(
    defaultValues?.vehicleType || ""
  );
  const [driverName, setDriverName] = useState(
    defaultValues?.driverName || ""
  );
  const [driverCNIC, setDriverCNIC] = useState(
    defaultValues?.driverCNIC || ""
  );
  const [driverPhone, setDriverPhone] = useState(
    defaultValues?.driverPhone || ""
  );
  const [companyName, setCompanyName] = useState(
    defaultValues?.companyName || ""
  );
  const [items, setItems] = useState<PassItem[]>(
    defaultValues?.items || [{ name: "", quantity: 1, unit: "pcs", estimatedValue: 0 }]
  );

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unit: "pcs", estimatedValue: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PassItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredItems = items.filter((item) => item.name.trim());
    await onSubmit({
      passType,
      description,
      expectedDate,
      expectedTime,
      vehicleNumber: vehicleNumber || undefined,
      vehicleType: vehicleType || undefined,
      driverName: driverName || undefined,
      driverCNIC: driverCNIC || undefined,
      driverPhone: driverPhone || undefined,
      companyName: companyName || undefined,
      items: filteredItems.length > 0 ? filteredItems : undefined,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pass Type */}
          <div className="space-y-2">
            <Label htmlFor="passType">
              Pass Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={passType}
              onValueChange={setPassType}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pass type" />
              </SelectTrigger>
              <SelectContent>
                {PASS_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is being moved..."
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedDate">
                Expected Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expectedDate"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedTime">Expected Time</Label>
              <Input
                id="expectedTime"
                type="time"
                value={expectedTime}
                onChange={(e) => setExpectedTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g., ABC-1234"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={vehicleType}
                  onValueChange={setVehicleType}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Driver Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Driver full name"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverCNIC">Driver CNIC</Label>
                <Input
                  id="driverCNIC"
                  value={driverCNIC}
                  onChange={(e) =>
                    setDriverCNIC(
                      e.target.value.replace(/\D/g, "").slice(0, 13)
                    )
                  }
                  placeholder="13-digit CNIC"
                  className="font-mono"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverPhone">Driver Phone</Label>
                <Input
                  id="driverPhone"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="Phone number"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company or vendor name"
              disabled={isLoading}
            />
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-end border rounded-lg p-3"
                >
                  <div className="col-span-12 sm:col-span-4 space-y-1">
                    <Label className="text-xs">Item Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        updateItem(index, "name", e.target.value)
                      }
                      placeholder="Item name"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(index, "unit", e.target.value)
                      }
                      placeholder="pcs"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-3 space-y-1">
                    <Label className="text-xs">Est. Value (Rs)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.estimatedValue}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "estimatedValue",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={isLoading || items.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !passType || !description || !expectedDate}
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
