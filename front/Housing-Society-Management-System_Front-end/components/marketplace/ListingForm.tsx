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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateListing } from "@/lib/hooks/entities/useMarketplace";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ListingForm() {
  const router = useRouter();
  const createMutation = useCreateListing();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    listingType: "",
    price: "",
    negotiable: false,
    condition: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.listingType) return;

    try {
      setIsSubmitting(true);
      const payload: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || formData.title,
        category: formData.category,
        listingType: formData.listingType,
        price: formData.price ? Number(formData.price) : 0,
        negotiable: formData.negotiable,
      };
      if (formData.condition) payload.condition = formData.condition;
      if (formData.location) payload.location = formData.location;
      await createMutation.mutateAsync(payload);
      router.push("/marketplace");
    } catch {
      // Error handled by mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: string, value: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Post a new item or service
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="What are you listing?"
                value={formData.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your item or service..."
                value={formData.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => update("category", v)}
                >
                  <SelectTrigger id="category" className="w-full h-11 enhanced-input">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                    <SelectItem value="household">Household</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="listingType">Listing Type *</Label>
                <Select
                  value={formData.listingType}
                  onValueChange={(v) => update("listingType", v)}
                >
                  <SelectTrigger id="listingType" className="w-full h-11 enhanced-input">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sell">Sell</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="wanted">Wanted</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (PKR)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  min={0}
                  value={formData.price}
                  onChange={(e) => update("price", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(v) => update("condition", v)}
                >
                  <SelectTrigger id="condition" className="w-full h-11 enhanced-input">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="negotiable"
                checked={formData.negotiable}
                onCheckedChange={(checked) => update("negotiable", checked)}
              />
              <Label htmlFor="negotiable">Price is negotiable</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Block A, Near Gate 2"
                value={formData.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Listing
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
