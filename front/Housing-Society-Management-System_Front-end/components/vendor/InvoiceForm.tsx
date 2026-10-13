"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CreateInvoiceDto } from "@/lib/types/vendor";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceFormProps {
  mode: "create";
  defaultValues?: Partial<CreateInvoiceDto & { _id?: string }>;
  onSubmit: (data: CreateInvoiceDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InvoiceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    vendorId: defaultValues?.vendorId || "",
    societyId: defaultValues?.societyId || "",
    contractId: defaultValues?.contractId || "",
    workOrderId: defaultValues?.workOrderId || "",
    invoiceNumber: defaultValues?.invoiceNumber || "",
    invoiceDate: defaultValues?.invoiceDate
      ? new Date(defaultValues.invoiceDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    dueDate: defaultValues?.dueDate
      ? new Date(defaultValues.dueDate).toISOString().split("T")[0]
      : "",
    description: defaultValues?.description || "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(
    defaultValues?.lineItems?.length
      ? defaultValues.lineItems
      : [{ description: "", quantity: 1, unitPrice: 0, total: 0 }]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const amount = lineItems.reduce((sum, item) => sum + item.total, 0);
  const [taxRate, setTaxRate] = useState(0);
  const taxAmount = amount * (taxRate / 100);
  const totalAmount = amount + taxAmount;

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "description") {
        item.description = value as string;
      } else if (field === "quantity") {
        item.quantity = Math.max(0, Number(value) || 0);
        item.total = item.quantity * item.unitPrice;
      } else if (field === "unitPrice") {
        item.unitPrice = Math.max(0, Number(value) || 0);
        item.total = item.quantity * item.unitPrice;
      }

      updated[index] = item;
      return updated;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.vendorId.trim()) newErrors.vendorId = "Vendor is required";
    if (!formData.societyId.trim())
      newErrors.societyId = "Society is required";
    if (!formData.invoiceNumber.trim())
      newErrors.invoiceNumber = "Invoice number is required";
    if (!formData.invoiceDate) newErrors.invoiceDate = "Invoice date is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    if (lineItems.length === 0 || lineItems.every((li) => !li.description.trim()))
      newErrors.lineItems = "At least one line item is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const validLineItems = lineItems.filter((li) => li.description.trim());

    const payload: CreateInvoiceDto = {
      vendorId: formData.vendorId,
      societyId: formData.societyId,
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      amount,
      taxAmount,
      totalAmount,
      ...(formData.contractId && { contractId: formData.contractId }),
      ...(formData.workOrderId && { workOrderId: formData.workOrderId }),
      ...(formData.description && { description: formData.description }),
      lineItems: validLineItems,
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

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">
                Invoice Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                placeholder="Enter invoice number"
                disabled={isLoading}
              />
              {errors.invoiceNumber && (
                <p className="text-sm text-red-500">{errors.invoiceNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractId">Contract ID (Optional)</Label>
              <Input
                id="contractId"
                value={formData.contractId}
                onChange={(e) => handleChange("contractId", e.target.value)}
                placeholder="Enter contract ID"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">
                Invoice Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => handleChange("invoiceDate", e.target.value)}
                disabled={isLoading}
              />
              {errors.invoiceDate && (
                <p className="text-sm text-red-500">{errors.invoiceDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                disabled={isLoading}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>

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
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="Enter tax rate"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter invoice description"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
                disabled={isLoading}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </div>
            {errors.lineItems && (
              <p className="text-sm text-red-500">{errors.lineItems}</p>
            )}

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-muted/30"
                >
                  <div className="col-span-12 sm:col-span-5 space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
                      }
                      placeholder="Item description"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(index, "quantity", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(index, "unitPrice", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Total</Label>
                    <Input
                      type="number"
                      value={item.total.toFixed(2)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={isLoading || lineItems.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex flex-col items-end gap-2 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium w-28 text-right">
                  ${amount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Tax ({taxRate}%):
                </span>
                <span className="font-medium w-28 text-right">
                  ${taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-base font-bold">
                <span>Total:</span>
                <span className="w-28 text-right">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
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
              Submit Invoice
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
