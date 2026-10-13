"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PageTemplateProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageTemplate({
  title,
  description,
  children,
  className,
}: PageTemplateProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
