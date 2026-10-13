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
import { BillInfo } from "@/lib/types/billInfo";
import { RecordPaymentDto } from "@/lib/types/billInfo";
import { useRecordPayment } from "@/lib/hooks/entities/useBillInfo";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: BillInfo | null;
  onSuccess?: () => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  bill,
  onSuccess,
}: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [remarks, setRemarks] = useState("");
  const recordMutation = useRecordPayment();

  const remaining = bill
    ? (bill.remainingBalance ?? bill.totalPayable - (bill.totalPaid ?? 0))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > remaining) return;
    try {
      const data: RecordPaymentDto = {
        paymentAmount: amount,
        paymentDate: new Date(paymentDate).toISOString(),
        paymentMethod,
        notes: remarks.trim() || undefined,
      };
      await recordMutation.mutateAsync({ id: bill._id, data });
      setPaymentAmount("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setRemarks("");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // toast handled by mutation
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPaymentAmount("");
      setRemarks("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {bill ? (
              <>
                Bill: {bill.billNo} | Total: Rs {(bill.totalPayable ?? 0).toLocaleString()} |
                Remaining: Rs {remaining.toLocaleString()}
              </>
            ) : (
              "Record payment for this bill"
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
              max={remaining}
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
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks..."
              rows={2}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={recordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                recordMutation.isPending ||
                !paymentAmount ||
                parseFloat(paymentAmount) <= 0 ||
                parseFloat(paymentAmount) > remaining
              }
            >
              {recordMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
