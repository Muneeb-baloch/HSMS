"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  value?: string;
  onRemove?: () => void;
  className?: string;
}

export function FilterChip({
  label,
  value,
  onRemove,
  className,
}: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground",
        "backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/20",
        className
      )}
    >
      <span>
        {label}
        {value && <span className="text-muted-foreground">: {value}</span>}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-0.5 transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label={`Remove filter ${label}`}
        >
          <X className="size-3.5" />
        </button>
      )}
    </span>
  );
}
