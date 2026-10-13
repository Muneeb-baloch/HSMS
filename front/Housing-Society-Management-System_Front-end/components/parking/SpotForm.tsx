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
import { useCreateSpot } from "@/lib/hooks/entities/useParking";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SpotForm() {
  const router = useRouter();
  const createMutation = useCreateSpot();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    spotNumber: "",
    spotType: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.spotNumber || !formData.spotType) return;

    try {
      setIsSubmitting(true);
      await createMutation.mutateAsync(formData);
      router.push("/parking/spots");
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
        Back to Spots
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Parking Spot</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new parking spot to the system
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Spot Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spotNumber">Spot Number *</Label>
              <Input
                id="spotNumber"
                placeholder="e.g. A-101"
                value={formData.spotNumber}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, spotNumber: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spotType">Spot Type *</Label>
              <Select
                value={formData.spotType}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, spotType: v }))
                }
              >
                <SelectTrigger id="spotType" className="w-full h-11 enhanced-input">
                  <SelectValue placeholder="Select spot type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="handicap">Handicap</SelectItem>
                  <SelectItem value="ev_charging">EV Charging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Block A, Basement Level 1"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Spot
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
