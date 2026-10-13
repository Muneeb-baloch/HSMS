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
import { ResolveDefaulterDto } from "@/lib/types/defaulter";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ResolveDefaulterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaulterName?: string;
  overdueAmount?: number;
  onSubmit: (data: ResolveDefaulterDto) => Promise<void>;
}

export function ResolveDefaulterDialog({
  open,
  onOpenChange,
  defaulterName,
  overdueAmount,
  onSubmit,
}: ResolveDefaulterDialogProps) {
  const today = new Date().toISOString().split("T")[0];
  const [paymentAmount, setPaymentAmount] = useState(
    overdueAmount ? String(overdueAmount) : "0"
  );
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    try {
      setIsSubmitting(true);
      await onSubmit({
        paymentAmount: amount,
        paymentDate: new Date(paymentDate).toISOString(),
        paymentMethod,
        remarks: remarks.trim() || undefined,
      });
      setPaymentAmount(overdueAmount ? String(overdueAmount) : "0");
      setPaymentDate(today);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPaymentAmount(overdueAmount ? String(overdueAmount) : "0");
      setPaymentDate(today);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Resolve Defaulter</DialogTitle>
          <DialogDescription>
            {defaulterName
              ? `Record payment for ${defaulterName}`
              : "Record the payment details below."}
            {overdueAmount !== undefined && (
              <span className="block mt-2 text-amber-600 font-medium">
                Overdue amount: Rs {overdueAmount.toLocaleString()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Payment Amount</Label>
            <Input
              id="paymentAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (optional)</Label>
            <Input
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks..."
            />
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
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isNaN(parseFloat(paymentAmount)) ||
                parseFloat(paymentAmount) <= 0
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
