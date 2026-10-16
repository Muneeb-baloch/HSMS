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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChangeNominee } from "@/lib/hooks/entities/useFile";
import { useNomineesByMember } from "@/lib/hooks/entities/useNominee";
import { File } from "@/lib/types/file";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const NONE_VALUE = "__none__";

interface ChangeNomineeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null | undefined;
}

export function ChangeNomineeModal({
  open,
  onOpenChange,
  file,
}: ChangeNomineeModalProps) {
  const memberId = file?.member?.id ?? file?.member?._id ?? "";
  const { data: nominees, isLoading } = useNomineesByMember(memberId);
  const changeMutation = useChangeNominee();

  const [selected, setSelected] = useState<string>(NONE_VALUE);

  useEffect(() => {
    if (open) {
      setSelected(file?.nomineeId ? String(file.nomineeId) : NONE_VALUE);
    }
  }, [open, file?.nomineeId]);

  const handleSubmit = async () => {
    if (!file) return;
    try {
      await changeMutation.mutateAsync({
        id: file._id || file.id,
        nomineeId: selected === NONE_VALUE ? undefined : selected,
      });
      onOpenChange(false);
    } catch {
      // toast handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Change Nominee</DialogTitle>
          <DialogDescription>
            Only nominees belonging to {file?.member?.memName || "this member"}{" "}
            can be chosen. Clear the selection to remove the nominee.
          </DialogDescription>
        </DialogHeader>

        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Select a nominee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>— No nominee —</SelectItem>
            {isLoading ? (
              <SelectItem value="__loading__" disabled>
                Loading nominees...
              </SelectItem>
            ) : (
              nominees?.map((nominee) => (
                <SelectItem key={nominee._id} value={nominee._id}>
                  {nominee.nomineeName} ({nominee.nomineeCNIC})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={changeMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={changeMutation.isPending}>
            {changeMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
