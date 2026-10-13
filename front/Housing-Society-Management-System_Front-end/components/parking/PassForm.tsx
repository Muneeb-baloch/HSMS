"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIssuePass } from "@/lib/hooks/entities/useParking";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PassForm() {
  const router = useRouter();
  const issueMutation = useIssuePass();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    issuedTo: "",
    vehicleNumber: "",
    purpose: "",
    validFrom: "",
    validUntil: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.issuedTo || !formData.vehicleNumber || !formData.purpose) return;

    try {
      setIsSubmitting(true);
      await issueMutation.mutateAsync(formData);
      router.push("/parking/passes");
    } catch {
      // Error handled by mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Passes
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Issue Parking Pass</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Issue a new parking pass
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Pass Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issuedTo">Issued To *</Label>
              <Input
                id="issuedTo"
                placeholder="Member name or ID"
                value={formData.issuedTo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, issuedTo: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
              <Input
                id="vehicleNumber"
                placeholder="e.g. ABC-1234"
                value={formData.vehicleNumber}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, vehicleNumber: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Select
                value={formData.purpose}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, purpose: v }))
                }
              >
                <SelectTrigger id="purpose" className="w-full h-11 enhanced-input">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, validFrom: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, validUntil: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Issue Pass
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
