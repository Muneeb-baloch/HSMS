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
import { useState } from "react";

const CATEGORY_OPTIONS = [
  { label: "General", value: "general" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Security", value: "security" },
  { label: "Events", value: "events" },
  { label: "Suggestions", value: "suggestions" },
  { label: "Lost & Found", value: "lost_and_found" },
  { label: "Help", value: "help" },
  { label: "Discussion", value: "discussion" },
];

interface ThreadFormProps {
  defaultValues?: {
    title?: string;
    content?: string;
    category?: string;
    isAnonymous?: boolean;
    tags?: string[];
  };
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ThreadForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Create Thread",
}: ThreadFormProps) {
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [content, setContent] = useState(defaultValues?.content || "");
  const [category, setCategory] = useState(defaultValues?.category || "");
  const [isAnonymous, setIsAnonymous] = useState(
    defaultValues?.isAnonymous || false
  );
  const [tagsInput, setTagsInput] = useState(
    defaultValues?.tags?.join(", ") || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await onSubmit({
      title,
      content,
      category,
      isAnonymous,
      tags,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter thread title"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              rows={8}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., urgent, parking, water"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              disabled={isLoading}
            />
            <Label htmlFor="anonymous">Post Anonymously</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading || !title || !content || !category}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
