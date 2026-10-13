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
import { useGenerateBills } from "@/lib/hooks/entities/useBillInfo";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/API/client";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface GenerateBillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GenerateBillsModal({
  open,
  onOpenChange,
  onSuccess,
}: GenerateBillsModalProps) {
  const currentYear = new Date().getFullYear();
  const [billTypeId, setBillTypeId] = useState<string>("");
  const [month, setMonth] = useState(
    MONTHS[new Date().getMonth()]
  );
  const [year, setYear] = useState(String(currentYear));
  const [dueDate, setDueDate] = useState(
    new Date(currentYear, new Date().getMonth() + 1, 15)
      .toISOString()
      .split("T")[0]
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const generateMutation = useGenerateBills();

  const { data: billTypesData } = useQuery({
    queryKey: ["billTypes", "dropdown"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: { value: string; label: string }[] }>(
        "/billtype/dropdown"
      );
      if (res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    },
    enabled: open,
  });

  const billTypes = billTypesData ?? [];

  useEffect(() => {
    if (billTypes.length > 0 && !billTypeId) {
      setBillTypeId(billTypes[0].value);
    }
  }, [billTypes, billTypeId]);

  const { data: membersData } = useQuery({
    queryKey: ["members", "list"],
    queryFn: async () => {
      const res = await apiClient.get<{
        members: { _id: string; memName?: string; fullName?: string }[];
        pagination?: unknown;
      }>("/members", { params: { limit: 500 } });
      if (res.data.success && res.data.data) {
        const d = res.data.data as { members?: { _id: string; memName?: string; fullName?: string }[] };
        return d.members ?? [];
      }
      return [];
    },
    enabled: open,
  });

  const members = membersData || [];

  const handleToggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.length === members.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(members.map((m) => m._id));
    }
  };

  const billMonth = `${month} ${year}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberIds.length === 0) return;
    try {
      if (!billTypeId) return;
      await generateMutation.mutateAsync({
        memberIds: selectedMemberIds,
        billTypeId,
        billMonth,
        dueDate: new Date(dueDate).toISOString(),
      });
      setSelectedMemberIds([]);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // toast handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Bills</DialogTitle>
          <DialogDescription>
            Generate bills for selected members
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                min="2020"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bill Type</Label>
            <Select value={billTypeId} onValueChange={setBillTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select bill type" />
              </SelectTrigger>
              <SelectContent>
                {billTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Select Members</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedMemberIds.length === members.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
              {members.slice(0, 50).map((m) => (
                <label
                  key={m._id}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(m._id)}
                    onChange={() => handleToggleMember(m._id)}
                  />
                  {m.memName || m.fullName || m._id}
                </label>
              ))}
              {members.length > 50 && (
                <p className="text-xs text-muted-foreground">
                  Showing first 50. Total: {members.length}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedMemberIds.length} member(s) selected
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={generateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                generateMutation.isPending ||
                selectedMemberIds.length === 0 ||
                !billTypeId
              }
            >
              {generateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Bills
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
