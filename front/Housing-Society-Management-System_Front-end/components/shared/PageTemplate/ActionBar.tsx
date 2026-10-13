"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ActionBarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function ActionBar({ left, right, className }: ActionBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">{left}</div>
      <div className="flex shrink-0 items-center gap-3">{right}</div>
    </div>
  );
}
