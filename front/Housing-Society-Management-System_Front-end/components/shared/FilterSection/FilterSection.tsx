"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FilterChip } from "./FilterChip";

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface FilterSectionProps {
  title?: string;
  children: React.ReactNode;
  activeFilters?: ActiveFilter[];
  className?: string;
}

export function FilterSection({
  title,
  children,
  activeFilters = [],
  className,
}: FilterSectionProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-black/20 p-4 shadow-lg backdrop-blur-md",
        className
      )}
    >
      {title && (
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="flex flex-wrap gap-3">{children}</div>
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((f) => (
            <FilterChip
              key={f.key}
              label={f.label}
              value={f.value}
              onRemove={f.onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
