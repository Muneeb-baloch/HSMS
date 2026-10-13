"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { SendNoticeDto } from "@/lib/types/defaulter";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface SendNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaulterName?: string;
  onSubmit: (data: SendNoticeDto) => Promise<void>;
}

export function SendNoticeDialog({
  open,
  onOpenChange,
  defaulterName,
  onSubmit,
}: SendNoticeDialogProps) {
  const [noticeType, setNoticeType] = useState<"WARNING" | "FINAL" | "LEGAL">("WARNING");
  const [noticeContent, setNoticeContent] = useState("");
  const [sendMethod, setSendMethod] = useState<"EMAIL" | "SMS" | "LETTER" | "ALL">("EMAIL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noticeContent.trim().length < 10) return;
    try {
      setIsSubmitting(true);
      await onSubmit({ noticeType, noticeContent: noticeContent.trim(), sendMethod });
      setNoticeContent("");
      onOpenChange(false);
    } catch {
      // Error feedback is expected to be handled by the onSubmit caller (e.g., mutation's onError)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setNoticeContent("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Send Notice
          </DialogTitle>
          <DialogDescription>
            {defaulterName
              ? `Send notice to ${defaulterName}`
              : "Fill in the notice details below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noticeType">Notice Type</Label>
            <Select
              value={noticeType}
              onValueChange={(v) => setNoticeType(v as any)}
            >
              <SelectTrigger id="noticeType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="FINAL">Final Notice</SelectItem>
                <SelectItem value="LEGAL">Legal Action</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="noticeContent">Notice Content (min 10 chars)</Label>
            <Textarea
              id="noticeContent"
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="Enter notice content..."
              rows={4}
              className="resize-none"
              required
              minLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sendMethod">Send Method</Label>
            <Select
              value={sendMethod}
              onValueChange={(v) => setSendMethod(v as any)}
            >
              <SelectTrigger id="sendMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="LETTER">Letter</SelectItem>
                <SelectItem value="ALL">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || noticeContent.trim().length < 10}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Notice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
