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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface PollOption {
  text: string;
  description: string;
}

interface PollFormProps {
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PollForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: PollFormProps) {
  const [title, setTitle] = useState(
    (defaultValues?.title as string) || ""
  );
  const [description, setDescription] = useState(
    (defaultValues?.description as string) || ""
  );
  const [pollType, setPollType] = useState(
    (defaultValues?.pollType as string) || "single_choice"
  );
  const [startDate, setStartDate] = useState(
    (defaultValues?.startDate as string)?.slice(0, 10) || ""
  );
  const [endDate, setEndDate] = useState(
    (defaultValues?.endDate as string)?.slice(0, 10) || ""
  );
  const [isAnonymous, setIsAnonymous] = useState(
    (defaultValues?.isAnonymous as boolean) || false
  );
  const [options, setOptions] = useState<PollOption[]>(
    (defaultValues?.options as PollOption[]) || [
      { text: "", description: "" },
      { text: "", description: "" },
    ]
  );

  const addOption = () => {
    setOptions((prev) => [...prev, { text: "", description: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOption = (
    index: number,
    field: keyof PollOption,
    value: string
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      description,
      pollType,
      startDate,
      endDate,
      isAnonymous,
      options: options.filter((o) => o.text.trim() !== ""),
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter poll title"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter poll description"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pollType">Poll Type</Label>
              <Select
                value={pollType}
                onValueChange={setPollType}
                disabled={isLoading}
              >
                <SelectTrigger id="pollType" className="h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_choice">Single Choice</SelectItem>
                  <SelectItem value="multiple_choice">
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value="yes_no">Yes/No</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="isAnonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                disabled={isLoading}
              />
              <Label htmlFor="isAnonymous">Anonymous Voting</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={isLoading}
              >
                <Plus className="size-4" />
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        updateOption(index, "text", e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      required
                      disabled={isLoading}
                    />
                    <Input
                      value={option.description}
                      onChange={(e) =>
                        updateOption(index, "description", e.target.value)
                      }
                      placeholder="Description (optional)"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 mt-1"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2 || isLoading}
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Create Poll
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
