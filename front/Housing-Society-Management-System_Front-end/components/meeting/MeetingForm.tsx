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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MeetingFormValues {
  title: string;
  description: string;
  meetingType: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isOnline: boolean;
  onlineLink: string;
  quorumRequired: number;
}

interface MeetingFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<MeetingFormValues>;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const initialValues: MeetingFormValues = {
  title: "",
  description: "",
  meetingType: "general",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  isOnline: false,
  onlineLink: "",
  quorumRequired: 0,
};

export function MeetingForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: MeetingFormProps) {
  const [formData, setFormData] = useState<MeetingFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defaultValues) {
      setFormData((prev) => ({
        ...prev,
        ...defaultValues,
        date: defaultValues.date
          ? new Date(defaultValues.date).toISOString().split("T")[0]
          : "",
      }));
    }
  }, [defaultValues]);

  const handleChange = (name: keyof MeetingFormValues, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.meetingType) {
      newErrors.meetingType = "Meeting type is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.location.trim() && !formData.isOnline) {
      newErrors.location = "Location is required for in-person meetings";
    }
    if (formData.isOnline && !formData.onlineLink.trim()) {
      newErrors.onlineLink = "Online meeting link is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Record<string, unknown> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      meetingType: formData.meetingType,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location.trim(),
      isOnline: formData.isOnline,
      onlineLink: formData.isOnline ? formData.onlineLink.trim() : "",
      quorumRequired: Number(formData.quorumRequired) || 0,
    };

    onSubmit(payload);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter meeting title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter meeting description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Meeting Type & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meetingType">
                Meeting Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.meetingType}
                onValueChange={(value) => handleChange("meetingType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agm">Annual General Meeting (AGM)</SelectItem>
                  <SelectItem value="special">Special Meeting</SelectItem>
                  <SelectItem value="committee">Committee Meeting</SelectItem>
                  <SelectItem value="emergency">Emergency Meeting</SelectItem>
                  <SelectItem value="general">General Meeting</SelectItem>
                </SelectContent>
              </Select>
              {errors.meetingType && (
                <p className="text-sm text-red-500">{errors.meetingType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Location {!formData.isOnline && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="location"
              placeholder="Enter meeting location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Online Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="isOnline"
              checked={formData.isOnline}
              onCheckedChange={(checked) => handleChange("isOnline", checked)}
            />
            <Label htmlFor="isOnline">This is an online meeting</Label>
          </div>

          {/* Online Link (shown when isOnline) */}
          {formData.isOnline && (
            <div className="space-y-2">
              <Label htmlFor="onlineLink">
                Online Meeting Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="onlineLink"
                placeholder="e.g. https://zoom.us/j/123456789"
                value={formData.onlineLink}
                onChange={(e) => handleChange("onlineLink", e.target.value)}
              />
              {errors.onlineLink && (
                <p className="text-sm text-red-500">{errors.onlineLink}</p>
              )}
            </div>
          )}

          {/* Quorum Required */}
          <div className="space-y-2">
            <Label htmlFor="quorumRequired">Quorum Required (number of members)</Label>
            <Input
              id="quorumRequired"
              type="number"
              min="0"
              placeholder="0"
              value={formData.quorumRequired || ""}
              onChange={(e) =>
                handleChange("quorumRequired", parseInt(e.target.value) || 0)
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Meeting" : "Update Meeting"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
